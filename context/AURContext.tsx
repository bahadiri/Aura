
import React, { createContext, useContext, useState, useCallback } from 'react';

export type AURType = 'master' | 'search' | 'info' | 'image' | 'list' | 'custom';

export interface AURPosition {
    top?: string | number;
    left?: string | number;
    right?: string | number;
    bottom?: string | number;
    width?: string | number;
    height?: string | number;
}

export interface AURState {
    id: string;
    type: AURType;
    title: string;
    isVisible: boolean;
    isMinimized: boolean;
    zIndex: number;
    position?: AURPosition;
    data?: any;
    aspectRatio?: number;
    lastPulse?: number; // Timestamp for signaling
}

interface AURContextType {
    aurs: AURState[];
    registerAUR: (aur: AURState) => void;
    openAUR: (id: string, data?: any) => void;
    closeAUR: (id: string) => void;
    minimizeAUR: (id: string) => void;
    focusAUR: (id: string) => void;
    updateAUR: (id: string, patch: Partial<AURState>) => void;
    checkOverlap: (p1?: AURPosition, p2?: AURPosition) => boolean;
    broadcastSignal: (context: string) => void;
    currentSignal: string | null;
}

const AURContext = createContext<AURContextType | undefined>(undefined);

export const AURProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [aurs, setAurs] = useState<AURState[]>([]);
    const [currentSignal, setCurrentSignal] = useState<string | null>(null);
    const [maxZ, setMaxZ] = useState(10);

    const normalizePos = (pos: AURPosition) => {
        const widthBasis = 1200;
        const heightBasis = 800;

        const parse = (v: any, basis: number) => {
            if (v === undefined) return undefined;
            if (typeof v === 'number') return (v / basis) * 100;
            const str = String(v);
            if (str.includes('%')) return parseFloat(str);
            if (str.includes('px')) return (parseFloat(str) / basis) * 100;
            return parseFloat(str);
        };

        const w = parse(pos.width, widthBasis) || 30;
        const h = parse(pos.height, heightBasis) || 30;
        let l = 0;
        let t = 0;

        if (pos.left !== undefined) l = parse(pos.left, widthBasis) || 0;
        else if (pos.right !== undefined) l = 100 - (parse(pos.right, widthBasis) || 0) - w;

        if (pos.top !== undefined) t = parse(pos.top, heightBasis) || 0;
        else if (pos.bottom !== undefined) t = 100 - (parse(pos.bottom, heightBasis) || 0) - h;

        return { l, t, w, h };
    };

    const checkOverlap = (p1?: AURPosition, p2?: AURPosition) => {
        if (!p1 || !p2) return false;
        const r1 = normalizePos(p1);
        const r2 = normalizePos(p2);

        return !(r1.l + r1.w <= r2.l ||
            r2.l + r2.w <= r1.l ||
            r1.t + r1.h <= r2.t ||
            r2.t + r2.h <= r1.t);
    };

    const findFreePosition = (target: AURState, existing: AURState[]): AURPosition | undefined => {
        if (!target.position) return undefined;
        let p = { ...target.position };
        let collision = true;
        let attempts = 0;

        while (collision && attempts < 15) {
            collision = false;
            for (const other of existing) {
                if (other.id !== target.id && other.isVisible && !other.isMinimized && other.position) {
                    if (checkOverlap(p, other.position)) {
                        // Nudge strategy: try right, then down
                        if (p.left !== undefined) {
                            if (typeof p.left === 'string' && p.left.includes('%')) {
                                p.left = (parseFloat(p.left) + 5) + '%';
                                if (parseFloat(p.left) > 80) { // Wrap around
                                    p.left = '5%';
                                    p.top = (parseFloat(p.top as string || '0') + 10) + '%';
                                }
                            } else {
                                (p.left as number) += 50;
                            }
                        } else if (p.right !== undefined) {
                            if (typeof p.right === 'string' && p.right.includes('%')) {
                                p.right = (parseFloat(p.right) - 5) + '%';
                            }
                        }
                        collision = true;
                        break;
                    }
                }
            }
            attempts++;
        }
        return p;
    };

    const registerAUR = useCallback((aur: AURState) => {
        setAurs((prev: AURState[]) => {
            if (prev.find(a => a.id === aur.id)) return prev;
            return [...prev, aur];
        });
    }, []);

    const openAUR = useCallback((id: string, data?: any) => {
        setAurs((prev: AURState[]) => {
            const target = prev.find(a => a.id === id);
            if (!target) return prev;

            const adjustedPos = findFreePosition(target, prev);

            return prev.map(aur =>
                aur.id === id ? {
                    ...aur,
                    isVisible: true,
                    isMinimized: false,
                    zIndex: maxZ + 1,
                    data: data || aur.data,
                    position: adjustedPos || aur.position
                } : aur
            );
        });
        setMaxZ((prev: number) => prev + 1);
    }, [maxZ]);

    const closeAUR = useCallback((id: string) => {
        setAurs((prev: AURState[]) => prev.map(aur =>
            aur.id === id ? { ...aur, isVisible: false } : aur
        ));
    }, []);

    const minimizeAUR = useCallback((id: string) => {
        setAurs((prev: AURState[]) => prev.map(aur =>
            aur.id === id ? { ...aur, isMinimized: !aur.isMinimized } : aur
        ));
    }, []);

    const focusAUR = useCallback((id: string) => {
        setAurs((prev: AURState[]) => prev.map(aur =>
            aur.id === id ? { ...aur, zIndex: maxZ + 1 } : aur
        ));
        setMaxZ((prev: number) => prev + 1);
    }, [maxZ]);

    const updateAUR = useCallback((id: string, patch: Partial<AURState>) => {
        setAurs((prev: AURState[]) => prev.map(aur =>
            aur.id === id ? { ...aur, ...patch } : aur
        ));
    }, []);

    const broadcastSignal = useCallback((context: string) => {
        setCurrentSignal(context);
        // Reset signal after a pulse
        setTimeout(() => setCurrentSignal(null), 100);
    }, []);

    return (
        <AURContext.Provider value={{
            aurs, registerAUR, openAUR, closeAUR, minimizeAUR, focusAUR, updateAUR, checkOverlap, broadcastSignal, currentSignal
        }}>
            {children}
        </AURContext.Provider>
    );
};

export const useAUR = () => {
    const context = useContext(AURContext);
    if (!context) throw new Error('useAUR must be used within an AURProvider');
    return context;
};
