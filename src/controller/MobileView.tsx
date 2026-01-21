import React, { useState, useRef, useEffect } from 'react';
import { WindowState } from './types';
import { atmosphere } from '../atmosphere';

interface MobileViewProps {
    windows: WindowState[];
    controller: any;
}

type DockLayout = 'draggable' | 'right-sidebar' | 'left-sidebar' | 'bottom-bar' | 'top-bar';

const DockButton: React.FC<{
    win: WindowState;
    isActive: boolean;
    onClick: () => void;
    orientation: 'vertical' | 'horizontal';
}> = ({ win, isActive, onClick, orientation }) => {
    const manifest = atmosphere.get(win.manifestId);
    const icon = manifest?.meta.icon;

    return (
        <button
            onClick={onClick}
            style={{
                width: 40, height: 40, borderRadius: 12, border: 'none',
                backgroundColor: isActive ? 'var(--primary, #007AFF)' : '#f0f0f0',
                color: isActive ? '#fff' : '#333',
                fontWeight: 'bold', fontSize: '1.2rem',
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: isActive ? '0 2px 8px rgba(0,122,255,0.3)' : 'none',
                flexShrink: 0,
                overflow: 'hidden'
            }}
        >
            {icon && icon.length > 2
                ? <img src={icon} alt="icon" style={{ width: '60%', height: '60%', objectFit: 'contain' }} />
                : <span>{icon || '?'}</span>
            }
        </button>
    );
};

const Dock: React.FC<{
    windows: WindowState[];
    controller: any;
    layout: DockLayout;
}> = ({ windows, controller, layout }) => {
    // Shared State for Draggable
    const [position, setPosition] = useState({ x: 20, y: 100 });
    const [dragging, setDragging] = useState(false);
    const dragOffset = useRef({ x: 0, y: 0 });

    const handleStart = (clientX: number, clientY: number) => {
        setDragging(true);
        dragOffset.current = { x: clientX - position.x, y: clientY - position.y };
    };

    const handleMove = (clientX: number, clientY: number) => {
        if (!dragging) return;
        setPosition({ x: clientX - dragOffset.current.x, y: clientY - dragOffset.current.y });
    };

    const handleEnd = () => setDragging(false);

    // Event listeners for drag
    useEffect(() => {
        const onMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
        const onMouseUp = () => handleEnd();
        const onTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientX, e.touches[0].clientY);
        const onTouchEnd = () => handleEnd();

        if (dragging) {
            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onMouseUp);
            window.addEventListener('touchmove', onTouchMove);
            window.addEventListener('touchend', onTouchEnd);
        }
        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
            window.removeEventListener('touchmove', onTouchMove);
            window.removeEventListener('touchend', onTouchEnd);
        };
    }, [dragging]);

    if (windows.length === 0) return null;

    // --- Layout Styles ---
    const baseStyle: React.CSSProperties = {
        position: 'fixed',
        zIndex: 10000,
        display: 'flex',
        gap: 8,
        padding: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(0,0,0,0.05)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        transition: dragging ? 'none' : 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
        touchAction: 'none'
    };

    let style = { ...baseStyle };
    let orientation: 'vertical' | 'horizontal' = 'vertical';

    switch (layout) {
        case 'right-sidebar':
            style = { ...style, right: 0, top: '50%', transform: 'translateY(-50%)', flexDirection: 'column', borderRadius: '16px 0 0 16px', borderRight: 'none' };
            orientation = 'vertical';
            break;
        case 'left-sidebar':
            style = { ...style, left: 0, top: '50%', transform: 'translateY(-50%)', flexDirection: 'column', borderRadius: '0 16px 16px 0', borderLeft: 'none' };
            orientation = 'vertical';
            break;
        case 'bottom-bar':
            style = { ...style, bottom: 0, left: '50%', transform: 'translateX(-50%)', flexDirection: 'row', borderRadius: '16px 16px 0 0', borderBottom: 'none', width: '100%', justifyContent: 'center', maxWidth: 600 };
            orientation = 'horizontal';
            break;
        case 'top-bar':
            style = { ...style, top: 60, left: '50%', transform: 'translateX(-50%)', flexDirection: 'row', borderRadius: 16 };
            orientation = 'horizontal';
            break;
        case 'draggable':
        default:
            style = { ...style, left: position.x, top: position.y, flexDirection: 'column', borderRadius: 16 };
            orientation = 'vertical';
            break;
    }

    return (
        <div style={style}>
            {/* Drag Handle (Only for draggable) */}
            {layout === 'draggable' && (
                <div
                    onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
                    onTouchStart={(e) => handleStart(e.touches[0].clientX, e.touches[0].clientY)}
                    style={{
                        width: '100%', height: 12, backgroundColor: '#eee', borderRadius: 4,
                        cursor: 'grab', display: 'flex', justifyContent: 'center', alignItems: 'center',
                        marginBottom: 4
                    }}
                >
                    <div style={{ width: 20, height: 4, backgroundColor: '#ccc', borderRadius: 2 }} />
                </div>
            )}

            {windows.map(win => (
                <DockButton
                    key={win.id}
                    win={win}
                    isActive={!win.isMinimized}
                    onClick={() => {
                        if (win.isMinimized) controller.focusWindow(win.id);
                        else controller.minimizeWindow(win.id);
                    }}
                    orientation={orientation}
                />
            ))}
        </div>
    );
};

// Helper for random color
const activeHash = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash;
    }
    return Math.abs(hash) / 2147483647;
};

export const MobileView: React.FC<MobileViewProps> = ({ windows, controller }) => {
    const [layout, setLayout] = useState<DockLayout>('draggable');
    const carouselWindows = windows.filter(w => !w.isMinimized);
    const scrollRef = useRef<HTMLDivElement>(null);
    const lastActiveRef = useRef<string | null>(null);

    // Layout cycler for demo purposes
    const cycleLayout = () => {
        const layouts: DockLayout[] = ['draggable', 'right-sidebar', 'left-sidebar', 'bottom-bar', 'top-bar'];
        const nextIndex = (layouts.indexOf(layout) + 1) % layouts.length;
        setLayout(layouts[nextIndex]);
    };

    // Auto-scroll logic
    useEffect(() => {
        if (carouselWindows.length === 0) return;
        const topWindow = [...carouselWindows].sort((a, b) => b.zIndex - a.zIndex)[0];
        if (topWindow && topWindow.id !== lastActiveRef.current) {
            const el = document.getElementById(`mobile-slide-${topWindow.id}`);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', inline: 'center' });
                lastActiveRef.current = topWindow.id;
            }
        }
    }, [carouselWindows, windows]);

    return (
        <>
            {/* The Full Screen Carousel Overlay */}
            {carouselWindows.length > 0 && (
                <div
                    ref={scrollRef}
                    style={{
                        position: 'fixed',
                        top: 0, left: 0, width: '100%', height: 'calc(100% - 0px)', // Adjust if bottom bar
                        zIndex: 9998,
                        backgroundColor: 'var(--bg-app, #fff)',
                        display: 'flex',
                        overflowX: 'auto',
                        scrollSnapType: 'x mandatory',
                        scrollBehavior: 'smooth',
                        paddingBottom: layout === 'bottom-bar' ? 60 : 0 // Add padding for bottom bar
                    }}
                >
                    {carouselWindows.map(win => {
                        const manifest = atmosphere.get(win.manifestId);
                        if (!manifest) return null;
                        const Component = manifest.component;
                        const title = win.props.title || (typeof manifest.meta.title === 'function' ? manifest.meta.title(controller.language) : manifest.meta.title);

                        return (
                            <div
                                id={`mobile-slide-${win.id}`}
                                key={win.id}
                                style={{
                                    flex: '0 0 100%',
                                    height: '100%',
                                    scrollSnapAlign: 'start',
                                    display: 'flex', flexDirection: 'column',
                                    position: 'relative'
                                }}
                            >
                                {/* Header */}
                                <div style={{
                                    height: 50, flexShrink: 0,
                                    borderBottom: '1px solid var(--border-subtle, #eee)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '0 16px', background: 'var(--bg-header, #f9f9f9)'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600 }}>
                                        <button onClick={() => controller.minimizeWindow(win.id)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', padding: '4px 8px' }}>←</button>
                                        <span>{title}</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <button onClick={cycleLayout} style={{ background: '#eee', border: 'none', padding: '4px 8px', borderRadius: 4, fontSize: '0.8rem', cursor: 'pointer' }}>Layout: {layout}</button>
                                        <button onClick={() => controller.closeWindow(win.id)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
                                    </div>
                                </div>

                                {/* Content */}
                                <div style={{ flex: 1, overflow: 'auto', position: 'relative' }}>
                                    <Component
                                        {...win.props}
                                        reflect={controller.reflect}
                                        language={controller.language}
                                        updateWindow={(d: any) => controller.updateWindow(win.id, d)}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* The Dock Controls */}
            <Dock windows={windows} controller={controller} layout={layout} />
        </>
    );
};
