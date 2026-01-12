import { useEffect, useRef } from 'react';
import { useAUR } from '../context/AURContext';

export const useAURSignal = () => {
    const { currentSignal, broadcastSignal } = useAUR();
    const callbacks = useRef<Record<string, ((data: any) => void)[]>>({});

    useEffect(() => {
        if (currentSignal) {
            const { type, data } = currentSignal;
            if (callbacks.current[type]) {
                callbacks.current[type].forEach(cb => cb(data));
            }
            // Also call a generic listener if needed
            if (callbacks.current['*']) {
                callbacks.current['*'].forEach(cb => cb({ type, data }));
            }
        }
    }, [currentSignal]);

    const onSignal = (type: string, callback: (data: any) => void) => {
        if (!callbacks.current[type]) callbacks.current[type] = [];
        callbacks.current[type].push(callback);

        return () => {
            callbacks.current[type] = callbacks.current[type].filter(cb => cb !== callback);
        };
    };

    return {
        broadcast: broadcastSignal,
        onSignal
    };
};
