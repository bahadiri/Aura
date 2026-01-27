import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useController } from './useController';
import { atmosphere } from '../atmosphere';
import { Rnd } from 'react-rnd';
import { flux } from '../flux';
import { FluxMessage } from '../flux/types';
import { getStorage } from '../storage';
import { AuraProject, useAura } from '../sdk';

import { MobileView } from './MobileView';

import { Sidebar } from '../components/Sidebar';
import { ChatInterface } from '../components/chat';

interface SpaceProps {
    projectId?: string;
    userId?: string; // Current user ID for permission checks
    onError?: (error: Error) => void;
    mobile?: boolean;
}

export const Space: React.FC<SpaceProps> = ({ projectId: initialProjectId, userId, onError, mobile }) => {
    const [currentChatId, setCurrentChatId] = useState<string | undefined>(initialProjectId || localStorage.getItem('aura_last_chat') || undefined);
    const [project, setProject] = useState<AuraProject | null>(null);
    const { apiUrl, ambience } = useAura();
    const [loading, setLoading] = useState(!!currentChatId);
    const [saving, setSaving] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const initializedRef = useRef(false);

    // Update currentChatId when initialProjectId changes (e.g. from URL)
    useEffect(() => {
        if (initialProjectId) {
            setCurrentChatId(initialProjectId);
        }
    }, [initialProjectId]);

    // Save last chat to localStorage
    useEffect(() => {
        if (currentChatId) {
            localStorage.setItem('aura_last_chat', currentChatId);
        }
    }, [currentChatId]);

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
    const { windows, spawnWindow, closeWindow, minimizeWindow, focusWindow, language, setLanguage, reflect, serialize, loadState, clearState } = controller;

    // 1. Initial Load
    useEffect(() => {
        const fetchProject = async () => {
            if (!currentChatId) {
                setProject(null);
                clearState();
                setLoading(false);
                initializedRef.current = true;
                return;
            }
            setLoading(true);
            try {
                // Use new Aura Storage Abstraction
                const storage = getStorage();
                console.log("[Space] Storage Driver:", (storage.documents as any).constructor.name);
                console.log("[Space] Fetching chat:", currentChatId);
                const data = await storage.documents.get<AuraProject>('projects', currentChatId);

                if (data) {
                    setProject(data);
                    console.log("[Space] Chat loaded via AuraStorage:", data.name);
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
                    } else {
                        clearState();
                    }
                    initializedRef.current = true;
                } else {
                    console.log(`[Space] Chat not found: ${currentChatId}. Creating on the go...`);
                    const newProject: AuraProject = {
                        id: currentChatId,
                        name: 'Untitled Chat',
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
                console.error("[Space] Failed to load chat", err);
                if (onError) onError(err instanceof Error ? err : new Error(String(err)));
                initializedRef.current = true;
            } finally {
                setLoading(false);
            }
        };
        fetchProject();
    }, [currentChatId]);

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
        if (!currentChatId || loading || !project) return;

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
                await storage.documents.update('projects', currentChatId, { state: fullState, updated_at: new Date().toISOString() });
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
    }, [currentChatId, windows, loading, project]);

    // 4. Auto-Rename Logic (triggers at 2 messages, updates at 10)
    const promptCount = useRef(0);
    const accumulatedPrompts = useRef<string[]>([]);
    const lastRenameAt = useRef(0);
    const { llm } = useAura();

    const generateTitle = async () => {
        try {
            console.log(`[Space] Generating title from ${accumulatedPrompts.current.length} prompts`);

            const prompt = `Based on the following user prompts, generate a concise and descriptive title (maximum 5 words) for this chat. Respond ONLY with the title.
            
            Prompts:
            ${accumulatedPrompts.current.join('\n')}
            
            Title:`;

            const res = await llm.invoke(
                { model: "gemini-2.5-flash", mode: "chat" },
                { messages: [{ role: "user", content: prompt }] }
            );

            const title = res.content.trim().replace(/^["']|["']$/g, '');
            console.log(`[Space] Title LLM response:`, title);

            if (title && title !== 'Untitled Chat') {
                console.log(`[Space] Auto-rename to: ${title}`);
                handleRename(title);
                lastRenameAt.current = promptCount.current;
            } else {
                console.log(`[Space] Title not changed - received: "${title}"`);
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
                if (promptCount.current === 2 && (project.name === 'Untitled Chat' || project.name === 'Untitled Project')) {
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
        if (!project || !currentChatId) return;
        if (userId && project.user_id !== userId) return;

        setProject({ ...project, name: newName });
        try {
            const storage = getStorage();
            await storage.documents.update('projects', currentChatId, { name: newName });
        } catch (err) { console.error(err); }
    };

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#666' }}>Loading Chat...</div>;
    }

    if (mobile) {
        return <MobileView windows={windows} controller={controller} />;
    }

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', display: 'flex' }}>
            {/* Left Sidebar */}
            <Sidebar
                isOpen={isSidebarOpen}
                toggle={() => {
                    setIsSidebarOpen(prev => !prev);
                }}
                currentChatId={currentChatId}
                onSelectChat={(id) => setCurrentChatId(id)}
                onNewChat={() => setCurrentChatId(crypto.randomUUID())}
            />

            {/* Left Chat Panel */}
            <div style={{
                width: 380,
                height: '100%',
                backgroundColor: 'var(--bg-sidebar)',
                borderRight: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                zIndex: 100
            }}>
                <ChatInterface
                    key={currentChatId}
                    initialMessages={project?.state?.chat?.messages || []}
                />
            </div>

            <div style={{ flex: 1, height: '100%', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'margin-left 0.3s ease' }}>
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
            </div>

            {saving && (
                <div style={{ position: 'fixed', bottom: 20, right: 20, color: 'var(--text-secondary)', fontSize: '0.8rem', zIndex: 10001, background: 'var(--bg-sidebar)', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                    Saving...
                </div>
            )}
        </div>
    );
};
