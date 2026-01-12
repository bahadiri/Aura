import React from 'react';
import { Rnd } from 'react-rnd';
import { useAUR, AURState } from '../context/AURContext';
import styles from './AUR.module.css';

interface AURContainerProps {
    id: string;
    children: React.ReactNode;
    style?: React.CSSProperties;
}

export const AURContainer: React.FC<AURContainerProps> = ({ id, children, style }) => {
    const { aurs, closeAUR, minimizeAUR, focusAUR, updateAUR } = useAUR();
    const state = aurs.find((a: AURState) => a.id === id);

    if (!state || !state.isVisible) return null;
    if (state.isMinimized) return null;

    // Handle percentage strings or numbers for initial position
    const getPos = (val: string | number | undefined, basis: number) => {
        if (val === undefined) return 0;
        if (typeof val === 'number') return val;
        // Simple conversion for initial render. 
        // Note: Rnd works best with px values for x/y in position prop.
        if (val.includes('%')) return (parseFloat(val) / 100) * basis;
        return parseFloat(val);
    };

    // Calculate initial pixels based on window size (approximation for initial mount)
    // For robust responsiveness, one might use a ResizeObserver on parent, but window is fine for now.
    const winW = window.innerWidth;
    const winH = window.innerHeight;

    const p = state.position || {};

    // We only use 'default' or controlled 'position' if we want to enforce it.
    // If we want state to be the source of truth, we use position + onDragStop to update state.
    // However, re-calculating PX from % on every render might cause jumps if window resizes.
    // We will stick to Rnd managing its own state while dragging, and syncing back to context on stop.
    // To allow Rnd to move freely, we can use `default` for the very first render, 
    // OR we can fully control it. controlled is better for "smart" placement updates (like openAUR).

    // Let's try fully controlled with a conversion helper.
    let x = p.left !== undefined ? getPos(p.left, winW) : undefined;
    if (x === undefined && p.right !== undefined) {
        const w = getPos(p.width, winW) || 300;
        x = winW - getPos(p.right, winW) - w;
    }

    let y = p.top !== undefined ? getPos(p.top, winH) : undefined;
    if (y === undefined && p.bottom !== undefined) {
        const h = getPos(p.height, winH) || 300;
        y = winH - getPos(p.bottom, winH) - h;
    }

    const width = getPos(p.width, winW) || 300;
    const height = getPos(p.height, winH) || 300;

    return (
        <Rnd
            className={styles.aurWrapper}
            size={{ width, height }}
            position={{ x: x || 0, y: y || 0 }}
            onDragStop={(e, d) => {
                // Save as pixels to avoid complexity with % for now
                updateAUR(id, {
                    position: {
                        ...p,
                        left: d.x,
                        top: d.y,
                        // Maintain current size since drag doesn't resize
                        width: width,
                        height: height,
                        right: undefined,
                        bottom: undefined
                    }
                });
            }}
            onResizeStop={(e, direction, ref, delta, position) => {
                updateAUR(id, {
                    position: {
                        ...p,
                        width: ref.style.width,
                        height: ref.style.height,
                        left: position.x,
                        top: position.y,
                        right: undefined,
                        bottom: undefined
                    }
                });
            }}
            onMouseDown={() => focusAUR(id)}
            style={{
                zIndex: state.zIndex,
                display: 'flex',
                flexDirection: 'column',
                ...style
            }}
            bounds="window"
            dragHandleClassName={styles.aurHeader}
        >
            <div className={styles.aurHeader} style={{ cursor: 'move' }}>
                <span className={styles.aurTitle}>{state.title}</span>
                <div className={styles.aurControls}>
                    <button
                        onClick={(e) => { e.stopPropagation(); minimizeAUR(id); }}
                        onMouseDown={(e) => e.stopPropagation()}
                        className={styles.minimizeBtn}
                    >_</button>
                    <button
                        onClick={(e) => { e.stopPropagation(); closeAUR(id); }}
                        onMouseDown={(e) => e.stopPropagation()}
                        className={styles.closeBtn}
                    >
                        ×
                    </button>
                </div>
            </div>
            <div className={styles.aurContent} style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                minHeight: 0
            }}>
                {children}
            </div>
        </Rnd>
    );
};
