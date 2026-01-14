import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useController } from './useController';
import { atmosphere } from '../atmosphere';
import { Rnd } from 'react-rnd';
import { flux } from '../flux';
import { FluxMessage } from '../flux/types';

interface SpaceProps {
    projectId?: string;
}

interface Project {
    id: string;
    name: string;
    state: any;
    updated_at: string;
}

export const Space: React.FC<SpaceProps> = ({ projectId }) => {
    // 1. Fetch Project Data & Initial State
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(!!projectId);
    const [saving, setSaving] = useState(false);
    const initializedRef = useRef(false);

    // We need to hold the initial state in a ref to pass it to useController ONLY once
    // or we can use useController's loadState method after mounting.
    // Given the hook structure, it's cleaner to use loadState.
    const controller = useController();
    const { windows, spawnWindow, closeWindow, minimizeWindow, focusWindow, language, setLanguage, reflect, serialize, loadState } = controller;

    useEffect(() => {
        if (!projectId) {
            setLoading(false);
            if (!initializedRef.current) {
                initializedRef.current = true;
            }
            return;
        }

        const fetchProject = async () => {
            try {
                const port = import.meta.env.VITE_SAGA_BACKEND_PORT || '8001';
                const token = (window as any).sagaToken;

                const baseUrl = import.meta.env.VITE_SAGA_API_URL || `http://localhost:${port}`;
                const res = await fetch(`${baseUrl}/api/projects/${projectId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!res.ok) throw new Error("Failed to load");
                const data = await res.json();
                setProject(data);

                if (data.state && data.state.windows && data.state.windows.length > 0) {
                    console.log("[Space] Loading state from backend:", data.state);
                    loadState(data.state);
                    initializedRef.current = true;
                } else {
                    console.log("[Space] No state found.");
                    initializedRef.current = true;
                }
            } catch (err) {
                console.error("[Space] Fetch error:", err);
                initializedRef.current = true;
            } finally {
                setLoading(false);
            }
        };

        if (!initializedRef.current) {
            fetchProject();
        }
    }, [projectId]);

    // 2. Auto-Save Logic
    const saveTimeoutRef = useRef<any>(null);
    const lastSavedState = useRef<string>("");

    // Keep a ref to serialize state without closure issues in timeout/cleanup
    const serializeRef = useRef(serialize);
    useEffect(() => {
        serializeRef.current = serialize;
    }, [serialize]);

    useEffect(() => {
        if (!projectId || loading) return;

        const currentState = serializeRef.current();
        const stateString = JSON.stringify(currentState);

        if (stateString === lastSavedState.current) return;

        console.debug("[Space] State changed, scheduling auto-save...");
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

        setSaving(true);
        saveTimeoutRef.current = setTimeout(async () => {
            try {
                const port = import.meta.env.VITE_SAGA_BACKEND_PORT || '8001';
                const token = (window as any).sagaToken;

                if (!token) {
                    console.warn("[Space] Cannot auto-save: No sagaToken found on window.");
                    return;
                }

                console.log("[Space] Auto-saving state to backend...");
                const baseUrl = import.meta.env.VITE_SAGA_API_URL || `http://localhost:${port}`;
                const res = await fetch(`${baseUrl}/api/projects/${projectId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        state: currentState
                    })
                });

                if (res.ok) {
                    lastSavedState.current = stateString;
                    console.log("[Space] Auto-save successful.");
                } else {
                    console.error("[Space] Auto-save failed with status:", res.status);
                }
            } catch (err) {
                console.error("[Space] Auto-save failed:", err);
            } finally {
                setSaving(false);
            }
        }, 1500); // Slightly faster debounce

        return () => {
            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        };
    }, [windows, language, projectId, loading]);

    // 4. Smart Naming Logic
    const promptCount = useRef(0);
    const accumulatedPrompts = useRef<string[]>([]);
    const hasAutoRenamed = useRef(false);

    useEffect(() => {
        const unsubscribe = flux.subscribe(async (msg: FluxMessage) => {
            if (msg.type === 'INTENT_DETECTED' && msg.payload.source === 'brainstorm-air') {
                if (hasAutoRenamed.current) return;

                // Only rename if currently untitled
                if (project && project.name !== "Untitled Project" && !project.name.startsWith("Untitled")) {
                    return;
                }

                promptCount.current += 1;
                accumulatedPrompts.current.push(msg.payload.text);

                if (promptCount.current === 3) {
                    hasAutoRenamed.current = true;
                    // Trigger Rename
                    try {
                        const port = import.meta.env.VITE_SAGA_BACKEND_PORT || '8001';
                        // Use fetch directly
                        const baseUrl = import.meta.env.VITE_SAGA_API_URL || `http://localhost:${port}`;
                        const res = await fetch(`${baseUrl}/api/generate-project-title`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ prompts: accumulatedPrompts.current })
                        });
                        const data = await res.json();
                        if (data.title) {
                            handleRename(data.title);
                        }
                    } catch (err) {
                        console.error("Auto-rename failed", err);
                    }
                }
            }
        });
        return unsubscribe;
    }, [project]); // Re-bind if project changes, but deps are tricky here. 
    // Actually, we want to capture 'project' state. 
    // If we include project in deps, we unsubscribe/resubscribe often.
    // Better to use ref for project name check or just check current state in a functional update?
    // Flux callback is a closure. 
    // Let's rely on 'hasAutoRenamed' blocking subsequent calls.
    // And simplistic check: if we are at count 3, we fire. 
    // The 'project.name' check inside the closure might be stale if we don't include it in deps.
    // Including 'project' in deps is safe enough given flux is cheap to sub/unsub.

    // 3. Rename Logic
    const handleRename = async (newName: string) => {
        if (!project || !projectId) return;
        // Optimistic update
        setProject({ ...project, name: newName });

        try {
            const port = import.meta.env.VITE_SAGA_BACKEND_PORT || '8001';
            const token = (window as any).sagaToken;

            const baseUrl = import.meta.env.VITE_SAGA_API_URL || `http://localhost:${port}`;
            await fetch(`${baseUrl}/api/projects/${projectId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: newName
                })
            });
        } catch (err) {
            console.error("Rename failed", err);
        }
    };


    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#666' }}>Loading Space...</div>;
    }

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

            {/* Main Desktop Area */}
            <div style={{
                flex: 1,
                position: 'relative',
                overflow: 'hidden',
                backgroundColor: 'var(--bg-primary)',
                backgroundImage: 'radial-gradient(var(--text-tertiary) 1px, transparent 1px)',
                backgroundSize: '24px 24px',
                opacity: 1 // Ensure visibility
            }}>
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
                            position={{ x: win.position.x, y: win.position.y }}
                            size={{ width: win.size?.width || 300, height: win.size?.height || 400 }}
                            onDragStop={(e, d) => {
                                controller.updateWindow(win.id, { position: { x: d.x, y: d.y } });
                            }}
                            onResizeStop={(e, direction, ref, delta, position) => {
                                controller.updateWindow(win.id, {
                                    size: { width: parseFloat(ref.style.width), height: parseFloat(ref.style.height) },
                                    position: position
                                });
                            }}

                            style={{
                                zIndex: win.zIndex,
                                background: 'rgba(255, 255, 255, 0.85)',
                                backdropFilter: 'blur(20px) saturate(180%)',
                                borderRadius: 16,
                                boxShadow: '0 10px 40px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.05)',
                                border: '1px solid rgba(255,255,255,0.4)',
                                overflow: 'hidden',
                                display: win.isMinimized ? 'none' : 'flex',
                                flexDirection: 'column',
                                color: '#000'
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
                                padding: '0 16px',
                                justifyContent: 'space-between',
                                cursor: 'move',
                                userSelect: 'none'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.2px' }}>
                                    {(manifest.meta.icon.startsWith('http') || manifest.meta.icon.startsWith('/')) ? (
                                        <img src={manifest.meta.icon} alt="" style={{ width: 16, height: 16, objectFit: 'contain' }} />
                                    ) : (
                                        <span style={{ fontSize: 16 }}>{manifest.meta.icon}</span>
                                    )}
                                    <span>{title}</span>
                                </div>

                                <div style={{ display: 'flex', gap: 6 }}>
                                    {/* Minimize Button */}
                                    <button
                                        onClick={(e) => { e.stopPropagation(); minimizeWindow(win.id); }}
                                        style={{
                                            width: 24, height: 24, borderRadius: '50%', border: 'none',
                                            background: 'rgba(0,0,0,0.05)', color: '#666',
                                            cursor: 'pointer', display: 'flex',
                                            alignItems: 'center', justifyContent: 'center',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.1)'; e.currentTarget.style.color = '#000'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.05)'; e.currentTarget.style.color = '#666'; }}
                                    >
                                        <svg width="8" height="2" viewBox="0 0 10 2" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <rect width="10" height="2" rx="1" fill="currentColor" />
                                        </svg>
                                    </button>

                                    {/* Close Button - Hidden for Brainstorm */}
                                    {win.manifestId !== 'brainstorm-air' && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); closeWindow(win.id); }}
                                            style={{
                                                width: 24, height: 24, borderRadius: '50%', border: 'none',
                                                background: 'rgba(0,0,0,0.05)', color: '#666',
                                                cursor: 'pointer', display: 'flex',
                                                alignItems: 'center', justifyContent: 'center',
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseEnter={(e) => { e.currentTarget.style.background = '#ff4b4b'; e.currentTarget.style.color = 'white'; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.05)'; e.currentTarget.style.color = '#666'; }}
                                        >
                                            <svg width="8" height="8" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M1 1L9 9M1 9L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Content */}
                            <div style={{ flex: 1, overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column', color: 'var(--text-primary)' }}>
                                <Component {...win.props} windows={windows} reflect={reflect} language={language} updateWindow={(data: any) => controller.updateWindow(win.id, data)} />
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
                height: 64,
                background: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(20px) saturate(180%)',
                borderRadius: 24,
                border: '1px solid rgba(255,255,255,0.8)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                padding: '0 20px',
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
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            title={title}
                        >
                            <div style={{
                                width: 42,
                                height: 42,
                                borderRadius: 12,
                                background: '#fff',
                                boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
                                display: 'flex',
                                alignItems: 'center',
                                justifySelf: 'center',
                                justifyContent: 'center',
                                fontSize: 22,
                                border: '1px solid rgba(0,0,0,0.05)',
                                transition: 'all 0.2s'
                            }}>
                                {(manifest.meta.icon.startsWith('http') || manifest.meta.icon.startsWith('/')) ? (
                                    <img src={manifest.meta.icon} alt="" style={{ width: 22, height: 22, objectFit: 'contain' }} />
                                ) : (
                                    manifest.meta.icon
                                )}
                            </div>
                            <div style={{
                                width: 4, height: 4, borderRadius: '50%',
                                background: 'var(--accent-highlight)', marginTop: 4,
                                opacity: win.isMinimized ? 0.3 : 1
                            }} />
                        </div>
                    );
                })}

                {windows.length > 0 && <div style={{ width: 1, height: 36, background: 'rgba(255,255,255,0.1)', margin: '0 12px' }} />}

                <button
                    onClick={() => setLanguage(l => l === 'en' ? 'tr' : 'en')}
                    style={{
                        padding: '8px 14px',
                        borderRadius: 10,
                        border: '1px solid rgba(255,255,255,0.1)',
                        background: 'rgba(255,255,255,0.05)',
                        color: '#fff',
                        fontWeight: 600,
                        fontSize: 12,
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                >
                    {language.toUpperCase()}
                </button>
            </div>
            {/* Status Indicators */}
            <div style={{
                position: 'fixed',
                bottom: '20px',
                right: '250px',
                zIndex: 10000,
                display: 'flex',
                gap: '12px',
                pointerEvents: 'none'
            }}>
                {saving && (
                    <div style={{
                        padding: '6px 12px',
                        backgroundColor: 'rgba(0,0,0,0.6)',
                        color: 'rgba(255,255,255,0.8)',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        border: '1px solid rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(10px)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#646cff', animation: 'pulse 1.5s infinite' }} />
                        Saving...
                    </div>
                )}
            </div>

            <style>{`
                @keyframes pulse {
                    0% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.5; transform: scale(0.8); }
                    100% { opacity: 1; transform: scale(1); }
                }
            `}</style>
        </div>
    );
};
