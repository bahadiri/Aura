import { useState, useEffect, useCallback } from 'react';
import { useAura } from '../sdk';
import { atmosphere } from '../atmosphere/index.js';
import { flux } from '../flux/index.js';
import { FluxMessage } from '../flux/types.js';
import { WindowState } from './types.js';
import { findOptimalPosition } from './windowLayout.js';
import { airSelector } from './selector.js';
import { stateFetcher } from './stateFetcher.js';

export function useControllerLogic(initialState?: any) {
    const [windows, setWindows] = useState<WindowState[]>([]);
    const [topZ, setTopZ] = useState(1);
    const [language, setLanguage] = useState<string>('en'); // Default language
    const [metadata, setMetadata] = useState<any>({});
    const { apiUrl, sessionId, llm } = useAura();

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
        // Special Logic for Singleton AIRs (Note Taker, Task Manager)
        let actualInstanceId = props.instanceId;
        if (!actualInstanceId && (manifestId === 'note-taker-air' || manifestId === 'tasks-air')) {
            const existingInstance = windows.find(w => w.manifestId === manifestId);
            if (existingInstance) {
                actualInstanceId = existingInstance.id;
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
                    case 'REQUEST_CONTROLLER_STATE':
                        flux.dispatch({
                            type: 'CONTROLLER_STATE',
                            payload: { windows },
                            to: 'all'
                        });
                        break;
                    case 'SYNC_METADATA':
                        setMetadata((prev: any) => ({ ...prev, ...msg.payload }));
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
            language,
            metadata
        };
        // JSON roundtrip strips functions, undefined, symbols, etc.
        return JSON.parse(JSON.stringify(rawState));
    };

    const loadState = (state: any) => {
        if (state && state.windows) {
            setWindows(state.windows);
            setTopZ(state.topZ || 10);
            if (state.language) setLanguage(state.language);
            if (state.metadata) {
                setMetadata(state.metadata);
                flux.dispatch({ type: 'METADATA_LOADED', payload: state.metadata, to: 'all' });
            }
        } else {
            // Explicit Reset for Project Isolation
            setWindows([]);
            setTopZ(1);
            setMetadata({});
        }
    };

    const clearState = () => {
        setWindows([]);
        setTopZ(1);
        setMetadata({});
    };

    const reflect = useCallback(async (message: string, messages: any[] = [], openAIRs: string[] = [], airContext: any = {}) => {
        console.log('[Controller] reflect() called with:', { message, openAIRs });

        // T34.2: Client-side AIR selection using Selector Engine
        const selectedAIRs = airSelector.selectAIRs(message, {
            limit: 5,
            activeSet: openAIRs  // Boost currently open AIRs
        });

        console.log('[Controller] Selected AIRs:', selectedAIRs.map(m => m.id));

        // T34.3: State Injection - Fetch state from open AIRs
        const openManifests = openAIRs
            .map(id => atmosphere.get(id))
            .filter(Boolean) as any[];

        const stateMap = await stateFetcher.fetchMultipleStates(
            openManifests,
            sessionId || 'default'
        );

        // Format state for LLM context
        const stateContext = stateFetcher.formatStateContext(stateMap, openManifests);

        // Merge state context with existing airContext
        const enhancedContext = {
            ...airContext,
            state: stateMap,
            stateFormatted: stateContext
        };

        console.log('[Controller] State Context:', stateContext);

        // Send only selected AIRs to backend (not all AIRs)
        const available_airs = selectedAIRs.map(m => ({
            id: m.id,
            title: m.meta.title,
            description: m.meta.description,
            instructions: m.instructions,
            tools: m.tools  // Include MCP tools
        }));

        try {
            // T35: Move reflection to Client Side using Gemini format
            const systemPrompt = `You are Aura's Brain. You manage a reactive space by retrieving Agentic Interface Respondents (AIRs).
Current Language: ${language}

Your goal is to decide which AIRs to spawn or what actions to take based on the user's query and the current state.

AVAILABLE AIRS:
${JSON.stringify(available_airs, null, 2)}

STATE CONTEXT:
${stateContext || "No active state context available."}

RULES:
1. Use 'spawn_air' to open or update an AIR window.
2. Use 'message' with an 'attachment' to display an AIR inline within the chat. 
3. Use 'tool_call' to invoke an MCP tool on a specific AIR.
4. If you need to respond to the user with text, use { action: 'message', id: 'assistant', props: { content: "..." } }.
5. RESPOND WITH VALID JSON ARRAY ONLY. NO MARKDOWN. NO EXPLANATIONS.

ACTIONS SCHEMA:
[
  { "action": "spawn_air", "id": "air-id", "props": { "title": "..." } },
  { "action": "message", "id": "assistant", "props": { "content": "Text response", "attachment": { "id": "air-id" } } },
  { "action": "tool_call", "id": "air-id", "tool": "tool_name", "args": { ... } }
]`;

            console.log("[Controller] Invoking Gemini reflection via:", `${apiUrl}/v1beta/models/gemini-2.5-flash:generateContent`);

            const res = await fetch(`${apiUrl}/v1beta/models/gemini-2.5-flash:generateContent`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: systemPrompt + "\n\nUser Message: " + message }]
                    }],
                    generationConfig: {
                        temperature: 0.1, // Even lower for actions
                        responseMimeType: "application/json"
                    }
                })
            });

            if (!res.ok) {
                const errText = await res.text();
                console.error("[Controller] Gemini API Error Details:", errText);
                throw new Error(`Gemini Error (${res.status})`);
            }

            const data = await res.json();
            const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!generatedText) {
                console.error("[Controller] Gemini returned no content:", data);
                throw new Error('No content generated by Gemini');
            }

            let actions;
            try {
                // Remove potential markdown fences just in case
                const cleanJson = generatedText.replace(/```json/g, '').replace(/```/g, '').trim();
                actions = JSON.parse(cleanJson);
            } catch (e) {
                console.error("[Controller] Failed to parse Gemini actions:", e, generatedText);
                actions = [{ action: 'message', id: 'assistant', props: { content: generatedText } }];
            }

            // Mark used AIRs as active for future selections
            if (Array.isArray(actions)) {
                for (const action of actions) {
                    if (action.id && action.id.endsWith('-air')) {
                        airSelector.markAsUsed(action.id);
                    }
                }
                return actions;
            }
        } catch (err) {
            console.error("[Controller] Reflection failed:", err);
            return [{ action: 'message', id: 'assistant', props: { content: "Sorry, I encountered an error processing that. Please try again." } }];
        }
        return [];
    }, [apiUrl, sessionId]); // Re-create if apiUrl or sessionId changes

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
        clearState,
        getContext,
        metadata
    };
}
