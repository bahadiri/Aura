import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useController } from './useController';
import { atmosphere } from '../atmosphere';
import { Rnd } from 'react-rnd';
import { flux } from '../flux';
import { FluxMessage } from '../flux/types';
import { getStorage } from '../storage';
import { AuraProject, useAura } from '../sdk';

import { MobileView } from './MobileView';

interface SpaceProps {
    projectId?: string;
    userId?: string; // Current user ID for permission checks
    onError?: (error: Error) => void;
    mobile?: boolean;
}

export const Space: React.FC<SpaceProps> = ({ projectId, userId, onError, mobile }) => {
    const [project, setProject] = useState<AuraProject | null>(null);
    const { apiUrl, ambience } = useAura();
    const [loading, setLoading] = useState(!!projectId);
    const [saving, setSaving] = useState(false);
    const initializedRef = useRef(false);

    // 0. Ingest Ambience (New)
    useEffect(() => {
        if (ambience) {
            console.log("[Space] Ingesting Ambience:", ambience.length);
            ambience.forEach((entry: any) => {
                // If the entry itself is a manifest or has one
                if (entry.id && entry.component) {
                    atmosphere.register(entry);
                }
            });
        }
    }, [ambience]);

    const controller = useController();
    const { windows, spawnWindow, closeWindow, minimizeWindow, focusWindow, language, setLanguage, reflect, serialize, loadState } = controller;

    // 1. Initial Load
    useEffect(() => {
        const fetchProject = async () => {
            if (!projectId) {
                setLoading(false);
                initializedRef.current = true;
                return;
            }
            setLoading(true);
            try {
                // Use new Aura Storage Abstraction
                const storage = getStorage();
                console.log("[Space] Storage Driver:", (storage.documents as any).constructor.name);
                console.log("[Space] Fetching project:", projectId);
                const data = await storage.documents.get<AuraProject>('projects', projectId);

                if (data) {
                    setProject(data);
                    console.log("[Space] Project loaded via AuraStorage:", data.name);
                    if (data.state) {
                        loadState(data.state);
                        // Restore Chat State if available
                        if (data.state.chat) {
                            flux.dispatch({
                                type: 'SYNC_CHAT_STATE',
                                payload: data.state.chat,
                                to: 'all' // Flux store should pick this up
                            });
                        }
                    }
                    initializedRef.current = true;
                } else {
                    console.log(`[Space] Project not found: ${projectId}. Creating on the go...`);
                    const newProject: AuraProject = {
                        id: projectId,
                        name: 'Untitled Project',
                        user_id: userId || 'anonymous',
                        state: controller.serialize(),
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    };
                    await storage.documents.create('projects', newProject);
                    setProject(newProject);
                    initializedRef.current = true;
                }
            } catch (err) {
                console.error("[Space] Failed to load project", err);
                if (onError) onError(err instanceof Error ? err : new Error(String(err)));
                initializedRef.current = true;
            } finally {
                setLoading(false);
            }
        };
        fetchProject();
    }, [projectId]);

    // 2. State Integration (Windows + Chat)
    const chatStateRef = useRef<any>(null);

    useEffect(() => {
        const unsubscribe = flux.subscribe((msg: FluxMessage) => {
            if (msg.type === 'SYNC_CHAT_STATE') {
                chatStateRef.current = msg.payload;
            }
        });
        return unsubscribe;
    }, []);

    // 3. Auto-Save Logic
    const saveTimeoutRef = useRef<any>(null);
    const lastSavedState = useRef<string>("");

    const serializeRef = useRef(serialize);
    useEffect(() => {
        serializeRef.current = serialize;
    }, [serialize]);

    useEffect(() => {
        if (!projectId || loading || !project) return;

        // Ownership Check: Only auto-save if current user is owner
        // Ownership Check: Only auto-save if current user is owner
        if (userId && project.user_id !== userId) {
            console.debug("[Space] Read-only mode: Not saving changes.");
            return;
        }

        const controllerState = serializeRef.current();
        // Merge chat state and then sanitize to remove functions/non-serializable data
        const rawState = {
            ...controllerState,
            chat: chatStateRef.current
        };
        // JSON roundtrip strips functions, undefined, symbols, etc. (Firestore compat)
        const fullState = JSON.parse(JSON.stringify(rawState));
        const stateString = JSON.stringify(fullState);

        if (stateString === lastSavedState.current) return;

        console.debug("[Space] State changed, scheduling auto-save...");
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

        setSaving(true);
        saveTimeoutRef.current = setTimeout(async () => {
            try {
                const storage = getStorage();
                // We update with Partial<Project>
                await storage.documents.update('projects', projectId, { state: fullState });
                lastSavedState.current = stateString;
            } catch (err) {
                console.error("[Space] Auto-save failed", err);
            } finally {
                setSaving(false);
            }
        }, 1000);

        return () => {
            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        };
    }, [projectId, windows, loading, project]);

    // 4. Auto-Rename Logic (triggers at 2 messages, updates at 10)
    const promptCount = useRef(0);
    const accumulatedPrompts = useRef<string[]>([]);
    const lastRenameAt = useRef(0);

    const generateTitle = async () => {
        try {
            if (!apiUrl) return;
            console.log(`[Space] Generating title from ${accumulatedPrompts.current.length} prompts`);
            const res = await fetch(`${apiUrl}/api/generate-project-title`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompts: accumulatedPrompts.current })
            });
            const data = await res.json();
            console.log(`[Space] Title API response:`, data);
            if (data.title && data.title !== 'Untitled Project') {
                console.log(`[Space] Auto-rename to: ${data.title}`);
                handleRename(data.title);
                lastRenameAt.current = promptCount.current;
            } else {
                console.log(`[Space] Title not changed - received: "${data.title}"`);
            }
        } catch (err) {
            console.error("[Space] Auto-rename failed", err);
        }
    };

    useEffect(() => {
        const unsubscribe = flux.subscribe((msg: FluxMessage) => {
            if (msg.type === 'CHAT_PROMPT' && msg.to === 'assistant') {
                if (!project) return;

                promptCount.current += 1;
                accumulatedPrompts.current.push(msg.payload.text);
                console.log(`[Space] Prompt ${promptCount.current}: "${msg.payload.text.substring(0, 50)}..."`);

                // Trigger at 2 messages (first rename)
                if (promptCount.current === 2 && project.name === 'Untitled Project') {
                    generateTitle();
                }
                // Update at 10 messages (refine based on more context)
                else if (promptCount.current === 10 && lastRenameAt.current < 10) {
                    generateTitle();
                }
            }
        });
        return unsubscribe;
    }, [project]);

    const handleRename = async (newName: string) => {
        if (!project || !projectId) return;
        if (userId && project.user_id !== userId) return;

        setProject({ ...project, name: newName });
        try {
            setProject({ ...project, name: newName });
            try {
                const storage = getStorage();
                await storage.documents.update('projects', projectId, { name: newName });
            } catch (err) { console.error(err); }
        } catch (err) { console.error(err); }
    };

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#666' }}>Loading Space...</div>;
    }

    if (mobile) {
        return <MobileView windows={windows} controller={controller} />;
    }

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {/* Main Desktop Area */}
            <div style={{
                flex: 1,
                position: 'relative',
                overflow: 'hidden',
                backgroundColor: 'var(--bg-app)',
                backgroundImage: 'radial-gradient(var(--text-tertiary) 1px, transparent 1px)',
                backgroundSize: '24px 24px'
            }}>
                {windows.map(win => {
                    const manifest = atmosphere.get(win.manifestId);
                    if (!manifest) return null;
                    const Component = manifest.component;
                    const title = win.props.title || (typeof manifest.meta.title === 'function' ? manifest.meta.title(language) : manifest.meta.title);

                    return (
                        <Rnd
                            key={win.id}
                            position={{ x: win.position.x, y: win.position.y }}
                            size={{ width: win.size?.width || 300, height: win.size?.height || 400 }}
                            onDragStop={(e, d) => controller.updateWindow(win.id, { position: { x: d.x, y: d.y } })}
                            onResizeStop={(e, dir, ref, delta, pos) => {
                                controller.updateWindow(win.id, {
                                    size: { width: parseFloat(ref.style.width), height: parseFloat(ref.style.height) },
                                    position: pos
                                });
                            }}
                            style={{
                                zIndex: win.zIndex,
                                background: 'var(--bg-sidebar)',
                                borderRadius: 16,
                                boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                                border: '1px solid var(--border-subtle)',
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
                                background: 'rgba(0,0,0,0.03)',
                                borderBottom: '1px solid var(--border-subtle)',
                                display: 'flex',
                                alignItems: 'center',
                                padding: '0 16px',
                                justifyContent: 'space-between',
                                cursor: 'move'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600 }}>
                                    {manifest.meta.icon.length > 2 ? <img src={manifest.meta.icon} style={{ width: 16, height: 16 }} /> : <span>{manifest.meta.icon}</span>}
                                    <span>{title}</span>
                                </div>
                                <div style={{ display: 'flex', gap: 6 }}>
                                    <button onClick={(e) => { e.stopPropagation(); minimizeWindow(win.id); }}>-</button>
                                    <button onClick={(e) => { e.stopPropagation(); closeWindow(win.id); }}>×</button>
                                </div>
                            </div>
                            <div style={{ flex: 1, overflow: 'hidden' }}>
                                <Component {...win.props} reflect={reflect} language={language} updateWindow={(d: any) => controller.updateWindow(win.id, d)} />
                            </div>
                        </Rnd>
                    );
                })}
            </div>

            {/* Taskbar */}
            <div style={{
                position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)',
                height: 64, background: 'var(--bg-sidebar)', borderRadius: 24, padding: '0 20px',
                display: 'flex', alignItems: 'center', gap: 12, border: '1px solid var(--border-subtle)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)', zIndex: 10000
            }}>
                {windows.map(win => (
                    <div key={win.id} onClick={() => win.isMinimized ? focusWindow(win.id) : minimizeWindow(win.id)} style={{ cursor: 'pointer' }}>
                        <div style={{ width: 42, height: 42, background: 'var(--bg-app)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                            {atmosphere.get(win.manifestId)?.meta.icon}
                        </div>
                    </div>
                ))}
            </div>

            {saving && (
                <div style={{ position: 'fixed', bottom: 20, right: 260, color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                    Saving...
                </div>
            )}
        </div>
    );
};
