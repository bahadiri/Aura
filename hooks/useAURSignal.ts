
import { useEffect } from 'react';
import { useAUR } from '../context/AURContext';

export const useAURSignal = (onSignal: (signal: string) => void) => {
    const { currentSignal } = useAUR();

    useEffect(() => {
        if (currentSignal) {
            onSignal(currentSignal);
        }
    }, [currentSignal, onSignal]);
};
