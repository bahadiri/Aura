import { useState, useEffect, useCallback } from 'react';
import { atmosphere } from '../atmosphere/index.js';
import { flux } from '../flux/index.js';
import { FluxMessage } from '../flux/types.js';
import { WindowState } from './types.js';

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

        // Calculate Position
        let position = { x: 100 + (windows.length * 20), y: 100 + (windows.length * 20) };
        if (manifest.meta.startPosition === 'center') {
            const width = manifest.meta.width || 400;
            const height = manifest.meta.height || 300;
            position = {
                x: (window.innerWidth / 2) - (width / 2),
                y: (window.innerHeight / 2) - (height / 2)
            };
        } else if (typeof manifest.meta.startPosition === 'object' && 'x' in manifest.meta.startPosition) {
            position = manifest.meta.startPosition;
        }

        const newWindow: WindowState = {
            id: `${manifestId}-${Date.now()}`,
            manifestId,
            props,
            zIndex: topZ + 1,
            position,
            size: { width: manifest.meta.width || 400, height: manifest.meta.height || 300 },
            isMinimized: false
        };

        setWindows(prev => [...prev, newWindow]);
        setTopZ(prev => prev + 1);
        console.debug(`[Controller] Spawned: ${newWindow.id}`);
    }, [topZ, windows]);

    // ... Flux logic ...

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

    return {
        windows,
        spawnWindow,
        closeWindow,
        minimizeWindow,
        focusWindow,
        language,
        setLanguage
    };
}
