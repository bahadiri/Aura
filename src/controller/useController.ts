import { useState, useEffect, useCallback } from 'react';
import { atmosphere } from '../atmosphere/index.js';
import { flux } from '../flux/index.js';
import { FluxMessage } from '../flux/types.js';
import { WindowState } from './types.js';
import { findOptimalPosition } from './windowLayout.js';

export function useController() {
    const [windows, setWindows] = useState<WindowState[]>([]);
    const [topZ, setTopZ] = useState(1);
    const [language, setLanguage] = useState<string>('en'); // Default language


    const spawnWindow = useCallback((manifestId: string, props: any = {}) => {
        const manifest = atmosphere.get(manifestId);
        if (!manifest) {
            console.error(`[Controller] AIR not found: ${manifestId}`);
            return;
        }

        const width = manifest.meta.width || 400;
        const height = manifest.meta.height || 300;

        // Calculate Position
        let position = { x: 100, y: 100 };

        if (manifest.meta.startPosition === 'center') {
            position = {
                x: (window.innerWidth / 2) - (width / 2),
                y: (window.innerHeight / 2) - (height / 2)
            };
        } else if (typeof manifest.meta.startPosition === 'object' && 'x' in manifest.meta.startPosition) {
            position = manifest.meta.startPosition as { x: number; y: number };
        } else {
            // Smart Positioning Logic
            position = findOptimalPosition(windows, { width, height }, { width: window.innerWidth, height: window.innerHeight });
        }

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
                // If it was minimized, restore it.
                // If it was already active and visible, maybe minimize it? 
                // For now, consistent "Launch/Focus" behavior = Bring to Front & Restore.
                // We'll handle "Minimize on click if active" in the View layer or here if we want toggle behavior.
                return { ...w, zIndex: topZ + 1, isMinimized: false };
            }
            return w;
        }));
        setTopZ(prev => prev + 1);
    };

    const reflect = useCallback(async (message: string) => {
        const available_airs = atmosphere.getAll().map(m => ({
            id: m.id,
            title: m.meta.title,
            description: m.meta.description
        }));

        try {
            const res = await fetch('http://localhost:8000/api/chat/reflect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message, available_airs })
            });
            const actions = await res.json();

            if (Array.isArray(actions)) {
                actions.forEach((action: any) => {
                    spawnWindow(action.id, action.props);
                });
                return actions;
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
        reflect
    };
}
