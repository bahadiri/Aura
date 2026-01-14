import { useState, useEffect, useCallback } from 'react';
import { atmosphere } from '../atmosphere/index.js';
import { flux } from '../flux/index.js';
import { FluxMessage } from '../flux/types.js';
import { WindowState } from './types.js';
import { findOptimalPosition } from './windowLayout.js';

export function useController(initialState?: any) {
    const [windows, setWindows] = useState<WindowState[]>([]);
    const [topZ, setTopZ] = useState(1);
    const [language, setLanguage] = useState<string>('en'); // Default language

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
        // Removed findOptimalPosition call to enforce simple floating behavior

        const newWindow: WindowState = {
            id: `${manifestId}-${Date.now()}`,
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
                // Support updating top-level properties like position/size
                // AND deep merging props if 'props' key is present.
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
        return {
            windows,
            topZ,
            language
        };
    };

    const loadState = (state: any) => {
        if (state && state.windows) {
            setWindows(state.windows);
            setTopZ(state.topZ || 10);
            if (state.language) setLanguage(state.language);
        }
    };

    const reflect = useCallback(async (message: string) => {
        const available_airs = atmosphere.getAll().map(m => ({
            id: m.id,
            title: m.meta.title,
            description: m.meta.description
        }));

        try {
            const port = import.meta.env.VITE_SAGA_BACKEND_PORT || '8001';
            const res = await fetch(`http://localhost:${port}/api/chat/reflect`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message, available_airs })
            });
            const actions = await res.json();

            if (Array.isArray(actions)) {
                if (Array.isArray(actions)) {
                    // Chat-First UX: Do NOT auto-spawn. Return actions for ChatInterface to render inline.
                    return actions;
                }
            }
        } catch (err) {
            console.error("[Controller] Reflection failed:", err);
        }
        return [];
    }, [spawnWindow]);

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
        loadState
    };
}
