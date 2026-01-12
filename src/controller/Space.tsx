import React from 'react';
import { useController } from './useController';
import { atmosphere } from '../atmosphere';
import { Rnd } from 'react-rnd';

export const Space: React.FC = () => {
    const { windows, spawnWindow, closeWindow, minimizeWindow, focusWindow, language, setLanguage } = useController();

    // Startup: Spawn Brainstorm by default
    const initialized = React.useRef(false);
    React.useEffect(() => {
        if (!initialized.current && windows.length === 0) {
            initialized.current = true;
            spawnWindow('brainstorm-air');
        }
    }, []); // Run once on mount

    // Debug: Expose control
    React.useEffect(() => {
        (window as any).aura = { spawnWindow };
    }, [spawnWindow]);

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

            {/* Main Desktop Area */}
            <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                {windows.map(win => {
                    const manifest = atmosphere.get(win.manifestId);
                    if (!manifest) return null;
                    const Component = manifest.component;
                    const manifestTitle = typeof manifest.meta.title === 'function'
                        ? manifest.meta.title(language)
                        : manifest.meta.title;
                    const title = win.props.title || manifestTitle;

                    return (
                        <Rnd
                            key={win.id}
                            default={{
                                x: win.position.x,
                                y: win.position.y,
                                width: win.size?.width || 300,
                                height: win.size?.height || 400
                            }}
                            style={{
                                zIndex: win.zIndex,
                                background: 'rgba(255, 255, 255, 0.95)',
                                backdropFilter: 'blur(10px)',
                                borderRadius: 16,
                                boxShadow: '0 10px 40px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.05)',
                                border: '1px solid rgba(0,0,0,0.1)',
                                overflow: 'hidden',
                                display: win.isMinimized ? 'none' : 'flex',
                                flexDirection: 'column'
                            }}
                            onMouseDown={() => focusWindow(win.id)}
                            dragHandleClassName="window-drag-handle"
                        >
                            {/* Title Bar */}
                            <div className="window-drag-handle" style={{
                                height: 40,
                                background: 'rgba(0,0,0,0.02)',
                                borderBottom: '1px solid rgba(0,0,0,0.05)',
                                display: 'flex',
                                alignItems: 'center',
                                padding: '0 14px',
                                justifyContent: 'space-between',
                                cursor: 'move',
                                userSelect: 'none'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, fontWeight: 600, color: '#1d1d1f' }}>
                                    {(manifest.meta.icon.startsWith('http') || manifest.meta.icon.startsWith('/')) ? (
                                        <img src={manifest.meta.icon} alt="" style={{ width: 18, height: 18, objectFit: 'contain' }} />
                                    ) : (
                                        <span style={{ fontSize: 18 }}>{manifest.meta.icon}</span>
                                    )}
                                    <span>{title}</span>
                                </div>

                                <div style={{ display: 'flex', gap: 8 }}>
                                    {/* Minimize Button */}
                                    <button
                                        onClick={(e) => { e.stopPropagation(); minimizeWindow(win.id); }}
                                        style={{
                                            width: 24, height: 24, borderRadius: '50%', border: 'none',
                                            background: 'rgba(0,0,0,0.05)', color: '#666',
                                            cursor: 'pointer', fontSize: 14, display: 'flex',
                                            alignItems: 'center', justifyContent: 'center',
                                            transition: 'background 0.2s',
                                            paddingBottom: 4 // Visual alignment for underscore
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.1)'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}
                                    >
                                        _
                                    </button>

                                    {/* Close Button - Hidden for Brainstorm */}
                                    {win.manifestId !== 'brainstorm-air' && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); closeWindow(win.id); }}
                                            style={{
                                                width: 24, height: 24, borderRadius: '50%', border: 'none',
                                                background: 'rgba(0,0,0,0.05)', color: '#666',
                                                cursor: 'pointer', fontSize: 14, display: 'flex',
                                                alignItems: 'center', justifyContent: 'center',
                                                transition: 'background 0.2s'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = '#ff5f56'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Content */}
                            <div style={{ flex: 1, overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column', color: '#1d1d1f' }}>
                                <Component {...win.props} language={language} />
                            </div>
                        </Rnd>
                    );
                })}
            </div>

            {/* Taskbar / Dock (Only for open windows) */}
            <div style={{
                position: 'absolute',
                bottom: 24,
                left: '50%',
                transform: 'translateX(-50%)',
                height: 70,
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(20px)',
                borderRadius: 24,
                border: '1px solid rgba(0,0,0,0.1)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                padding: '0 24px',
                zIndex: 10000,
                width: 'auto',
                maxWidth: '90vw'
            }}>
                {windows.map(win => {
                    const manifest = atmosphere.get(win.manifestId);
                    if (!manifest) return null;
                    const manifestTitle = typeof manifest.meta.title === 'function' ? manifest.meta.title(language) : manifest.meta.title;
                    const title = win.props.title || manifestTitle;

                    const isTopWindow = win.zIndex === Math.max(...windows.map(w => w.zIndex));

                    const handleDockClick = () => {
                        if (win.isMinimized) {
                            focusWindow(win.id); // Restore
                        } else if (isTopWindow) {
                            minimizeWindow(win.id); // Minimize if active
                        } else {
                            focusWindow(win.id); // Bring to front
                        }
                    };

                    return (
                        <div
                            key={win.id}
                            onClick={handleDockClick}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                cursor: 'pointer',
                                transition: 'transform 0.2s',
                                position: 'relative'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.15)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            title={title}
                        >
                            <div style={{
                                width: 44,
                                height: 44,
                                borderRadius: 12,
                                background: 'white',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 24,
                                border: '2px solid rgba(0,0,0,0.05)'
                            }}>
                                {(manifest.meta.icon.startsWith('http') || manifest.meta.icon.startsWith('/')) ? (
                                    <img src={manifest.meta.icon} alt="" style={{ width: 24, height: 24, objectFit: 'contain' }} />
                                ) : (
                                    manifest.meta.icon
                                )}
                            </div>
                            <div style={{
                                width: 4, height: 4, borderRadius: '50%',
                                background: '#646cff', marginTop: 4
                            }} />
                        </div>
                    );
                })}

                {windows.length > 0 && <div style={{ width: 1, height: 30, background: 'rgba(0,0,0,0.1)', margin: '0 10px' }} />}

                <button
                    onClick={() => setLanguage(l => l === 'en' ? 'tr' : 'en')}
                    style={{
                        padding: '6px 12px',
                        borderRadius: 8,
                        border: '1px solid rgba(0,0,0,0.1)',
                        background: 'white',
                        fontWeight: 600,
                        fontSize: 12,
                        cursor: 'pointer'
                    }}
                >
                    {language.toUpperCase()}
                </button>
            </div>
        </div>
    );
};
