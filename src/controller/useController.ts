import { useState, useEffect, useCallback } from 'react';
import { useAura } from '../sdk';
import { atmosphere } from '../atmosphere/index.js';
import { flux } from '../flux/index.js';
import { FluxMessage } from '../flux/types.js';
import { WindowState } from './types.js';
import { findOptimalPosition } from './windowLayout.js';

export function useController(initialState?: any) {
    const [windows, setWindows] = useState<WindowState[]>([]);
    const [topZ, setTopZ] = useState(1);
    const [language, setLanguage] = useState<string>('en'); // Default language
    const { apiUrl } = useAura();

    // Hydrate state on mount if provided
    useEffect(() => {
        if (initialState && initialState.windows) {
            setWindows(initialState.windows);
            setTopZ(initialState.topZ || 10);
            if (initialState.language) setLanguage(initialState.language);
        }
    }, []);


    const spawnWindow = useCallback((manifestId: string, props: any = {}) => {
        const manifest = atmosphere.get(manifestId);
        if (!manifest) {
            console.error(`[Controller] AIR not found: ${manifestId}`);
            return;
        }

        const width = manifest.meta.width || 400;
        const height = manifest.meta.height || 300;

        // Calculate Position - Default to floating centered/staggered
        const count = windows.length;
        const offset = count * 30; // Stagger slightly

        let position = {
            x: 100 + offset,
            y: 100 + offset
        };

        if (manifest.meta.startPosition === 'center') {
            position = {
                x: (window.innerWidth / 2) - (width / 2) + offset,
                y: (window.innerHeight / 2) - (height / 2) + offset
            };
        } else if (typeof manifest.meta.startPosition === 'object' && 'x' in manifest.meta.startPosition) {
            position = manifest.meta.startPosition as { x: number; y: number };
        }

        // Use explicitly provided ID if available (for Shared Identity/Pop-out)
        // Special Logic for Singleton AIRs (Note Taker)
        let actualInstanceId = props.instanceId;
        if (!actualInstanceId && manifestId === 'note-taker-air') {
            const existingNoteTaker = windows.find(w => w.manifestId === 'note-taker-air');
            if (existingNoteTaker) {
                actualInstanceId = existingNoteTaker.id;
            }
        }

        const instanceId = actualInstanceId || `${manifestId}-${Date.now()}`;

        // Check if window already exists
        const existing = windows.find(w => w.id === instanceId);
        if (existing) {
            // Update props if provided (crucial for 'append')
            if (Object.keys(props).length > 0) {
                updateWindow(instanceId, { props: { ...existing.props, ...props, updateTs: Date.now() } });
            }
            focusWindow(instanceId);
            return;
        }

        const newWindow: WindowState = {
            id: instanceId,
            manifestId,
            props,
            zIndex: topZ + 1,
            position,
            size: { width, height },
            isMinimized: false
        };

        setWindows(prev => [...prev, newWindow]);
        setTopZ(prev => prev + 1);
        console.debug(`[Controller] Spawned: ${newWindow.id} at`, position);
    }, [topZ, windows]);

    // Flux logic
    useEffect(() => {
        const unsubscribe = flux.subscribe((msg: FluxMessage) => {
            if (msg.to === 'controller') {
                switch (msg.type) {
                    case 'SPAWN_AIR':
                        spawnWindow(msg.payload.id, msg.payload.props);
                        break;
                    default:
                        break;
                }
            }
        });
        return unsubscribe;
    }, [spawnWindow]);

    // Window Actions
    const closeWindow = (id: string) => {
        setWindows(prev => prev.filter(w => w.id !== id));
        flux.dispatch({
            type: 'WINDOW_CLOSED',
            payload: { id },
            to: 'all' // Broadcast to anyone listening
        });
    };

    const minimizeWindow = (id: string) => {
        setWindows(prev => prev.map(w =>
            w.id === id ? { ...w, isMinimized: true } : w
        ));
    };

    const focusWindow = (id: string) => {
        setWindows(prev => prev.map(w => {
            if (w.id === id) {
                return { ...w, zIndex: topZ + 1, isMinimized: false };
            }
            return w;
        }));
        setTopZ(prev => prev + 1);
    };

    const updateWindow = (id: string, data: any) => {
        setWindows(prev => prev.map(w => {
            if (w.id === id) {
                const { props, ...topLevel } = data;

                let newProps = w.props;
                if (props) {
                    newProps = { ...newProps, ...props };
                }

                return { ...w, ...topLevel, props: newProps };
            }
            return w;
        }));
    };

    const serialize = () => {
        // Sanitize state to remove functions (Firestore doesn't support them)
        const rawState = {
            windows,
            topZ,
            language
        };
        // JSON roundtrip strips functions, undefined, symbols, etc.
        return JSON.parse(JSON.stringify(rawState));
    };

    const loadState = (state: any) => {
        if (state && state.windows) {
            setWindows(state.windows);
            setTopZ(state.topZ || 10);
            if (state.language) setLanguage(state.language);
        } else {
            // Explicit Reset for Project Isolation
            setWindows([]);
            setTopZ(1);
        }
    };

    const reflect = useCallback(async (message: string, messages: any[] = [], openAIRs: string[] = []) => {
        const available_airs = atmosphere.getAll().map(m => ({
            id: m.id,
            title: m.meta.title,
            description: m.meta.description
        }));

        try {
            if (!apiUrl) throw new Error("Aura API URL not configured");
            const res = await fetch(`${apiUrl}/api/chat/reflect`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message, messages, available_airs, open_airs: openAIRs })
            });

            if (!res.ok) {
                // Handle 404 or other errors more gracefully, maybe retry or just log as text
                const text = await res.text();
                console.error("[Controller] Reflection API Error:", res.status, text);
                // Fallback: If 404 (route missing?), maybe we are on a proxy that doesn't support chat yet?
                // Return a simple message response?
                return [{ action: 'message', id: 'assistant', props: { content: "I'm having trouble connecting to my brain (404). Please check the API configuration." } }];
            }

            const actions = await res.json();

            if (Array.isArray(actions)) {
                // Chat-First UX: Do NOT auto-spawn. Return actions for ChatInterface to render inline.
                return actions;
            }
        } catch (err) {
            console.error("[Controller] Reflection failed:", err);
            // Return empty so chat stops processing
            return [{ action: 'message', id: 'assistant', props: { content: "Sorry, I'm having trouble connecting." } }];
        }
        return [];
    }, [apiUrl]); // Only re-create if apiUrl changes. spawnWindow is stable or not needed here.

    const getContext = useCallback(() => {
        const context: any = {
            plots: [],
            characters: [],
            currentTheme: null
        };

        windows.forEach(w => {
            // Plot AIR Data
            if (w.props.moviePlot) {
                context.plots.push({ source: w.props.seriesTitle || "Movie", content: w.props.moviePlot });
            }
            if (w.props.initialEpisodes) {
                // Summarize episodes if needed, or just mention they are open
                context.plots.push({ source: w.props.seriesTitle || "Series", episodeCount: w.props.initialEpisodes.length });
            }

            // Other AIRs...
        });

        return context;
    }, [windows]);

    return {
        windows,
        spawnWindow,
        closeWindow,
        minimizeWindow,
        focusWindow,
        language,
        setLanguage,
        reflect,
        updateWindow,
        serialize,
        loadState,
        getContext
    };
}
