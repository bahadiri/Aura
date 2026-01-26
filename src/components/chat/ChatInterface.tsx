import React, { useState, useEffect, useRef } from 'react';
import { useController } from '../../controller/useController';
import { useVoiceInput } from '../../hooks/useVoiceInput';
import { flux } from '../../flux/index';
import { atmosphere } from '../../atmosphere/index';

export interface Message {
    role: 'user' | 'assistant';
    content: string;
    attachment?: { id: string, props: any, instanceId?: string };
}

export interface ChatInterfaceProps {
    initialMessages?: Message[];
    onMessageUpdate?: (messages: Message[]) => void;
    voiceConfig?: {
        selectedVoiceURI?: string;
    };
    /**
     * Optional callback when a message is sent. 
     * If not provided, the generic behavior (reflection/response) is used.
     */
    onSend?: (text: string) => void;
    placeholder?: string;
}

export const ChatInterface = ({
    initialMessages = [],
    onMessageUpdate,
    voiceConfig,
    onSend,
    placeholder = "Type or speak..."
}: ChatInterfaceProps) => {
    // Message now supports 'attachment'
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [poppedOutIds, setPoppedOutIds] = useState<Set<string>>(new Set());
    const [inputValue, setInputValue] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [activeAIRs, setActiveAIRs] = useState<string[]>([]);
    const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);

    // Aura Core Hooks
    const controller = useController();
    const {
        isListening,
        transcript,
        interimTranscript,
        startListening,
        stopListening,
        resetTranscript,
        error: voiceError,
        speak
    } = useVoiceInput();

    const inputRef = useRef<HTMLTextAreaElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const prevMessagesLength = useRef(0);

    // Sync initialMessages to internal state when it changes (hydration)
    useEffect(() => {
        if (initialMessages && initialMessages.length > 0) {
            // We only hydrate if we have messages and our local state differs? 
            // Or just trust parent? Let's trust parent updates if they are significant.
            // A simple equality check or length check might be enough to avoid loops if parent updates on every change.
            // For now, let's assume parent manages "initial" load, but we manage local updates.
            // Actually, if parent passes initialMessages, we set it once.
        }
    }, []); // Run once or when hydration key changes? Ideally we rely on useState(initialMessages). 
    // If parent updates messages (e.g. from backend poller), we might need to sync.
    // Let's add a `useEffect` to sync IF `initialMessages` changes and is different? 
    // This is tricky with 2-way binding. Let's stick to `useState` for now and assume `initialMessages` is truly initial.

    // Better: Sync LOCAL state changes to Parent
    useEffect(() => {
        if (onMessageUpdate) {
            onMessageUpdate(messages);
        }
    }, [messages, onMessageUpdate]);

    // Sync voice transcript to input (Final + Interim for real-time feel)
    useEffect(() => {
        // Prevent voice updates from overwriting input while sending/processing
        if (isProcessing || isSendingRef.current) return;

        if (isListening) {
            setInputValue(transcript + interimTranscript);
        } else if (transcript) {
            setInputValue(transcript);
        }
    }, [transcript, interimTranscript, isListening, isProcessing]);

    // Auto-scroll logic: Only scroll if enabled and new message added OR user was already at bottom
    useEffect(() => {
        const container = messagesContainerRef.current;
        if (!container) {
            prevMessagesLength.current = messages.length;
            return;
        }

        const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 150;
        const isNewMessage = messages.length > prevMessagesLength.current;

        if (isNewMessage && (autoScrollEnabled || isAtBottom)) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }

        prevMessagesLength.current = messages.length;
    }, [messages, autoScrollEnabled]);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const container = e.currentTarget;
        const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 50;
        if (isAtBottom && !autoScrollEnabled) {
            console.log("[Chat] Auto-scroll resumed");
            setAutoScrollEnabled(true);
        } else if (!isAtBottom && autoScrollEnabled) {
            console.log("[Chat] Auto-scroll paused");
            setAutoScrollEnabled(false);
        }
    };

    // Hydration Logic moved to Parent (Saga)

    // Sync state to Space/Controller for auto-save
    // Note: This logic seems specific to how Space works. 
    // Ideally Space listens to Flux, so we just dispatch events.
    useEffect(() => {
        flux.dispatch({
            type: 'SYNC_CHAT_STATE',
            payload: {
                messages,
                poppedOutIds: Array.from(poppedOutIds)
            },
            to: 'space' // Space listens for this
        });
    }, [messages, poppedOutIds]);

    // Track active AIRs (inline + Space via Flux)
    const [spaceAIRs, setSpaceAIRs] = useState<string[]>([]);

    useEffect(() => {
        const inlineAIRs = messages
            .filter(m => m.attachment && !poppedOutIds.has(m.attachment.instanceId || ''))
            .map(m => m.attachment!.id);

        const allActive = Array.from(new Set([...inlineAIRs, ...spaceAIRs]));
        setActiveAIRs(allActive);
    }, [messages, spaceAIRs, poppedOutIds]);

    // Flux State Sync
    useEffect(() => {
        const unsubscribe = flux.subscribe((msg: any) => {
            if (msg.type === 'WINDOW_CLOSED') {
                setPoppedOutIds(prev => {
                    const next = new Set(prev);
                    next.delete(msg.payload.id);
                    return next;
                });
                setSpaceAIRs(prev => prev.filter(id => id !== msg.payload.manifesId)); // Assuming payload has manifestId? Or we need to re-fetch
                // Actually easier to just Request State again or trust payload contains manifestId?
                // Standard WINDOW_CLOSED payload is { id }. ID is instanceId.
                // We need manifestId. Requesting full state is safer.
                flux.dispatch({ type: 'REQUEST_CONTROLLER_STATE', payload: {}, to: 'controller' });
            }
            if (msg.type === 'CONTROLLER_STATE') {
                const windows = msg.payload.windows || [];
                setSpaceAIRs(windows.map((w: any) => w.manifestId));
                console.log("[Chat] Synced Space AIRs:", windows.map((w: any) => w.manifestId));
            }
            if (msg.type === 'SPAWN_AIR' || msg.type === 'WINDOW_SPAWNED') {
                flux.dispatch({ type: 'REQUEST_CONTROLLER_STATE', payload: {}, to: 'controller' });
            }
            if (msg.type === 'ADD_CHAT_MESSAGE') {
                const { role, content, attachment } = msg.payload;
                setMessages(prev => [...prev, { role, content, attachment }]);
            }
            if (msg.type === 'SAY') {
                const { role, text } = msg.payload;
                // 1. Add visual message
                setMessages(prev => [...prev, { role, content: text }]);

                // 2. Speak
                if (text) {
                    // Strip emojis and formatting
                    const cleanForSpeech = text.replace(/[\u{1F600}-\u{1F6FF}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F018}-\u{1F270}\u{238C}-\u{2454}]/gu, '').trim();
                    const speechText = cleanForSpeech.replace(/\*\*/g, '').replace(/`/g, '');
                    speak(speechText, voiceConfig?.selectedVoiceURI);
                }
            }
        });

        // Initial Request
        flux.dispatch({ type: 'REQUEST_CONTROLLER_STATE', payload: {}, to: 'controller' });

        return unsubscribe;
    }, []);

    // Ref for synchronous locking of voice input during send
    const isSendingRef = useRef(false);

    const handleSend = async () => {
        if (!inputValue.trim() || isProcessing) return;

        // 1. Synchronously block voice updates
        isSendingRef.current = true;

        // 2. Stop listening immediately if active
        if (isListening) {
            stopListening();
        }

        // 3. Clear voice buffer & input *before* async work
        resetTranscript();
        const text = inputValue;
        setInputValue(''); // Immediate clear to prevent "ghost" text

        // Optimistic Update
        setMessages(prev => [...prev, { role: 'user', content: text }]);
        setIsProcessing(true);

        if (onSend) {
            onSend(text);
        }

        // Emit CHAT_PROMPT for auto-naming feature
        flux.dispatch({
            type: 'CHAT_PROMPT',
            payload: { text },
            to: 'assistant'
        });

        /* CONTEXT GATHERING */
        const gatherContext = async () => {
            return new Promise<any>((resolve) => {
                const contexts: any = {};
                let handled = false;

                // 1. Setup Listener
                const unsubscribe = flux.subscribe((msg: any) => {
                    if (msg.type === 'PROVIDE_CONTEXT' && msg.payload.context) {
                        console.log(`[Chat] Received Context from ${msg.payload.id}`, msg.payload.context);
                        contexts[msg.payload.id] = msg.payload.context;
                    }
                });

                // 2. Broadcast Request
                flux.dispatch({ type: 'REQUEST_CONTEXT', payload: { initiator: 'chat' }, to: 'all' });

                // 3. Timeout (Wait 300ms for local AIRs to respond)
                setTimeout(() => {
                    if (!handled) {
                        handled = true;
                        unsubscribe();
                        resolve(contexts);
                    }
                }, 300);
            });
        };

        try {
            // 3. REFLECTION STEP
            console.log("Reflecting on:", text);
            const airContext = await gatherContext();
            console.log("Active AIRs:", activeAIRs, "Context:", airContext);

            // Inject context into system prompt logic via reflect
            const actions = await controller.reflect(text, messages, activeAIRs, airContext);

            let finalContent = '';

            // 4. INLINE ATTACHMENTS (Chat-First UX)
            if (actions && Array.isArray(actions) && actions.length > 0) {
                console.log("[Chat] Received actions:", actions);
                console.log("[Chat] Active Windows:", controller.windows);

                const spawnedThisLoop = new Set<string>();
                const toolCallsToDefer: any[] = [];

                actions.forEach((action: any) => {
                    // Handle assistant messages with attachments FIRST
                    if (action.id === 'assistant' && action.props?.attachment) {
                        const attachment = action.props.attachment;
                        console.log(`[Chat] Assistant message has attachment:`, attachment);

                        // Spawn the AIR inline
                        if (!activeAIRs.includes(attachment.id) && !spawnedThisLoop.has(attachment.id)) {
                            console.log(`[Chat] Opening ${attachment.id} inline`);
                            spawnedThisLoop.add(attachment.id);
                            setMessages(prev => [...prev, {
                                role: 'assistant',
                                content: action.props.content || '',
                                attachment: {
                                    id: attachment.id,
                                    props: {},
                                    instanceId: attachment.instanceId || crypto.randomUUID()
                                }
                            }]);
                        }
                        return;
                    }

                    // Defer tool calls for newly spawned AIRs
                    if (action.action === 'call_tool') {
                        if (spawnedThisLoop.has(action.id)) {
                            console.log(`[Chat] Deferring tool call ${action.tool} on ${action.id} (AIR just spawned)`);
                            toolCallsToDefer.push(action);
                        } else {
                            console.log(`[Chat] Calling tool ${action.tool} on ${action.id}`, action.props);

                            // Get the AIR manifest
                            const manifest = atmosphere.get(action.id);
                            if (manifest && manifest.logic?.handleRequest) {
                                console.log(`[Chat] Routing to ${action.id} Kitchen`);

                                // Call the AIR's handleRequest ("Kitchen")
                                manifest.logic.handleRequest(action.tool, action.props);
                            } else {
                                console.warn(`[Chat] No handleRequest found for ${action.id}`);
                            }
                        }
                        return;
                    }

                    if (action.id === 'assistant') return;

                    // Broad Handling for TasksAIR Actions
                    if (action.id === 'tasks-air') {
                        console.log(`[Chat] Intercepting TasksAIR Action: ${action.action}`, action.props);

                        const act = (action.action || 'create').toLowerCase();
                        let fluxType = '';
                        let payload = { ...action.props };

                        // 1. Identify Intent
                        if (act.includes('add') || act.includes('create') || act.includes('spawn')) {
                            fluxType = 'ADD_TASK';
                            // Normalize payload if needed
                            if (payload.itemToAdd) payload.task = payload.itemToAdd;
                        } else if (act.includes('toggle') || act.includes('complete') || act.includes('finish') || act.includes('check') || act.includes('mark') || act.includes('cross')) {
                            fluxType = 'TOGGLE_TASK';
                        }

                        if (fluxType) {
                            console.log(`[Chat] Mapped ${action.action} to ${fluxType}`);

                            // 2. Ensure TasksAIR is Open (Inline Default)
                            if (!activeAIRs.includes('tasks-air') && !spawnedThisLoop.has('tasks-air')) {
                                console.log('[Chat] TasksAIR not active, opening INLINE');
                                spawnedThisLoop.add('tasks-air');
                                setMessages(prev => [...prev, {
                                    role: 'assistant',
                                    content: '', // Empty content, just the AIR
                                    attachment: {
                                        id: 'tasks-air',
                                        props: {},
                                        instanceId: crypto.randomUUID()
                                    }
                                }]);

                                // We don't need to dispatch SPAWN_AIR to controller anymore.
                                // The AIR will mount in the chat, connect to Flux, and handle the subsequent command.
                            }

                            // 3. Dispatch Command
                            setTimeout(() => {
                                console.log(`[Chat] Dispatching ${fluxType}`, payload);
                                flux.dispatch({
                                    type: fluxType,
                                    payload: payload,
                                    to: 'all'
                                });
                            }, 500); // Reduced delay slightly

                            return; // Handled
                        }
                    }

                    // Handle actions for Note Taker AIR
                    if (action.id === 'note-taker-air') {
                        const act = action.action.toLowerCase();

                        // Map manifest actions to internal logic
                        // 'append_note' -> append logic
                        // 'replace_note' -> 'replace' prop logic? (Currently logic.ts only handles 'content' append via props)
                        // 'polish_note' -> trigger polish? (Need to dispatch specific event or just rely on prop updates)

                        if (act === 'append_note' || act === 'append') {
                            // Check if it's inline (in chat messages)
                            const existingNoteIdx = messages.findIndex(
                                m => m.attachment?.id === 'note-taker-air' && !poppedOutIds.has(m.attachment.instanceId || '')
                            );

                            if (existingNoteIdx >= 0) {
                                // Update existing inline note
                                setMessages(prev => {
                                    const updated = [...prev];
                                    // Pass content delta + timestamp to trigger logic.ts effect
                                    updated[existingNoteIdx].attachment!.props.content = action.props.content;
                                    updated[existingNoteIdx].attachment!.props.updateTs = Date.now();
                                    return updated;
                                });
                            } else {
                                // Check if it's in Space (popped out or directly spawned there)
                                const spaceNoteTaker = controller.windows.find(w => w.manifestId === 'note-taker-air');
                                if (spaceNoteTaker) {
                                    // Dispatch append to controller
                                    flux.dispatch({
                                        type: 'SPAWN_AIR',
                                        payload: {
                                            id: action.id,
                                            props: { content: action.props.content, updateTs: Date.now() } // Contains content and updateTs
                                        },
                                        to: 'controller'
                                    });
                                } else {
                                    // No Note Taker exists anywhere - create new inline
                                    setMessages(prev => [...prev, {
                                        role: 'assistant',
                                        content: '',
                                        attachment: {
                                            id: action.id,
                                            props: { initialValue: action.props.content },
                                            instanceId: crypto.randomUUID()
                                        }
                                    }]);
                                }
                            }
                            return; // Handled
                        }
                    }

                    // Generic Spawning Logic (Restored)
                    // Generate deterministic ID for characters to allow updates
                    let instanceId: string = crypto.randomUUID();
                    if (action.id === 'characters-air' && (action.props.title || action.props.query)) {
                        const payload = action.props.title || action.props.query;
                        const slug = payload.toString().toLowerCase().replace(/[^a-z0-9]+/g, '-');
                        instanceId = `${action.id}-${slug}`;
                    }

                    setMessages(prev => [...prev, {
                        role: 'assistant',
                        content: '',
                        attachment: {
                            id: action.id,
                            props: action.props,
                            instanceId: instanceId
                        }
                    }]);
                });

                // Process deferred tool calls after AIRs have mounted
                if (toolCallsToDefer.length > 0) {
                    console.log(`[Chat] Processing ${toolCallsToDefer.length} deferred tool calls after delay`);
                    setTimeout(() => {
                        toolCallsToDefer.forEach((action) => {
                            console.log(`[Chat] Calling deferred tool ${action.tool} on ${action.id}`, action.props);

                            const manifest = atmosphere.get(action.id);
                            if (manifest && manifest.logic?.handleRequest) {
                                console.log(`[Chat] Routing deferred call to ${action.id} Kitchen`);
                                manifest.logic.handleRequest(action.tool, action.props);
                            } else {
                                console.warn(`[Chat] No handleRequest found for ${action.id}`);
                            }
                        });
                    }, 100); // Small delay to allow React to mount the components
                }
            }

            // 5. TEXT RESPONSE (Assistant Message)
            if (actions && Array.isArray(actions)) {
                const messageAction = actions.find((a: any) => a.id === 'assistant' || a.action === 'message');
                if (messageAction && messageAction.props && messageAction.props.content) {
                    finalContent = messageAction.props.content;
                }
            }

            // Only add text response if it's substantial
            if (finalContent.length > 0) {
                setMessages(prev => [...prev, { role: 'assistant', content: finalContent }]);
            }

            // Speak response if voice was used or requested
            if (finalContent) {
                speak(finalContent, voiceConfig?.selectedVoiceURI);
            }

        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I encountered an error processing that." }]);
        } finally {
            setIsProcessing(false);
            isSendingRef.current = false; // Release lock
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault(); // Prevent newline
            handleSend();
        }
    };

    // Flux Listener for Window Closure
    useEffect(() => {
        const unsubscribe = flux.subscribe((msg: any) => {
            if (msg.type === 'WINDOW_CLOSED') {
                setPoppedOutIds(prev => {
                    const next = new Set(prev);
                    next.delete(msg.payload.id);
                    return next;
                });
            }
        });
        return unsubscribe;
    }, []);

    const renderAttachment = (attachment: { id: string, props: any, instanceId?: string }) => {
        // Ensure we have an instanceId. Ideally this is set when message is created.
        const instanceId = attachment.instanceId || `${attachment.id}-${JSON.stringify(attachment.props).length}`;

        const manifest = atmosphere.get(attachment.id);
        const AIRComponent = manifest?.component;

        if (!AIRComponent) {
            return <div style={{ color: 'red' }}>Unknown Attachment: {attachment.id}</div>;
        }

        const isPoppedOut = poppedOutIds.has(instanceId);

        const handlePopOut = () => {
            setPoppedOutIds(prev => new Set(prev).add(instanceId));
            flux.dispatch({
                type: 'SPAWN_AIR',
                payload: {
                    id: attachment.id,
                    props: { ...attachment.props, instanceId } // Pass the ID!
                },
                to: 'controller'
            });
        };

        const handleBringBack = () => {
            setPoppedOutIds(prev => {
                const next = new Set(prev);
                next.delete(instanceId);
                return next;
            });
        };

        if (isPoppedOut) {
            return (
                <div style={{
                    marginTop: '10px',
                    border: '1px dashed var(--border-color)',
                    borderRadius: '12px',
                    padding: '20px',
                    backgroundColor: 'rgba(0,0,0,0.02)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    color: 'var(--text-secondary)'
                }}>
                    <span style={{ fontSize: '2rem' }}>↗</span>
                    <span>Active in Space</span>
                    <button
                        onClick={handleBringBack}
                        style={{
                            background: 'none',
                            border: '1px solid var(--border-color)',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            color: 'var(--text-primary)',
                            marginTop: '10px',
                            fontSize: '0.9rem'
                        }}
                    >
                        Display Here
                    </button>
                </div>
            );
        }

        const handleUpdateAttachment = (instanceId: string, newState: any) => {
            setMessages(prev => prev.map(msg => {
                if (msg.attachment && msg.attachment.instanceId === instanceId) {
                    // Merge new props
                    const updatedProps = { ...msg.attachment.props, ...newState.props };
                    return {
                        ...msg,
                        attachment: {
                            ...msg.attachment,
                            props: updatedProps
                        }
                    };
                }
                return msg;
            }));
        };

        return (
            <div style={{
                marginTop: '10px',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                overflow: 'hidden',
                backgroundColor: 'var(--bg-secondary)',
                width: '100%',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <div style={{
                    padding: '8px 12px',
                    borderBottom: '1px solid var(--border-color)',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    backgroundColor: 'rgba(0,0,0,0.05)'
                }}>
                    <button
                        onClick={handlePopOut}
                        style={{
                            border: 'none',
                            background: 'none',
                            color: 'var(--accent-primary)',
                            cursor: 'pointer',
                            fontSize: '0.9em',
                            fontWeight: 'bold'
                        }}
                    >
                        Pop Out ↗
                    </button>
                </div>
                <div style={{ padding: '10px' }}>
                    <AIRComponent
                        {...attachment.props}
                        updateWindow={(data: any) => handleUpdateAttachment(instanceId, data)}
                    />
                </div>
            </div>
        );
    };

    const handleMicClick = () => {
        if (isListening) {
            stopListening();
            console.log("[Chat] Mic stopped by user click");
        } else {
            startListening();
            console.log("[Chat] Mic started by user click");
        }
        // Always focus input so user can type or press Enter immediately
        // Use a small timeout to allow UI to update (e.g. tooltips/state)
        setTimeout(() => {
            if (inputRef.current) {
                inputRef.current.focus();
                console.log("[Chat] Input focused after mic toggle");
            }
        }, 150);
    };
    const renderMessageContent = (content: string) => {
        if (!content) return null;
        const parts = content.split(/(\*\*.*?\*\*|\[.*?\]\(.*?\))/g);
        return parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i}>{part.slice(2, -2)}</strong>;
            }
            if (part.startsWith('[') && part.includes('](') && part.endsWith(')')) {
                const labelMatch = part.match(/\[(.*?)\]/);
                const urlMatch = part.match(/\((.*?)\)/);
                const label = labelMatch ? labelMatch[1] : '';
                const url = urlMatch ? urlMatch[1] : '';
                return (
                    <a
                        key={i}
                        href={url}
                        target={url.startsWith('http') ? "_blank" : "_self"}
                        rel={url.startsWith('http') ? "noopener noreferrer" : ""}
                        style={{ color: 'inherit', textDecoration: 'underline', fontWeight: 500, cursor: 'pointer' }}
                        onClick={async (e) => {
                            if (url.startsWith('file://')) {
                                e.preventDefault();
                                const relativePath = url.replace('file://', '');
                                console.log('[ChatInterface] File link clicked:', relativePath);

                                try {
                                    // Fetch absolute path from server
                                    const response = await fetch(`/api/get-file-path?path=${encodeURIComponent(relativePath)}`);
                                    const data = await response.json();

                                    if (data.vscodeUri) {
                                        console.log('[ChatInterface] Opening file with VSCode URI:', data.vscodeUri);

                                        // Open with vscode:// URI (with absolute path)
                                        window.location.href = data.vscodeUri;

                                        // Dispatch event for logging
                                        flux.dispatch({
                                            type: 'FILE_LINK_CLICKED',
                                            payload: {
                                                url,
                                                path: relativePath,
                                                absolutePath: data.absolutePath,
                                                vscodeUri: data.vscodeUri
                                            },
                                            to: 'all'
                                        });
                                    }
                                } catch (err) {
                                    console.error('[ChatInterface] Failed to open file:', err);
                                    alert(`Failed to open file: ${relativePath}\n\nPlease open it manually in your editor.`);
                                }
                            }
                        }}
                    >
                        {label}
                    </a>
                );
            }
            return part;
        });
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Messages Area */}
            <div
                ref={messagesContainerRef}
                onScroll={handleScroll}
                style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '15px',
                    scrollBehavior: 'smooth'
                }}
            >
                {messages.map((msg, i) => (
                    <div key={i} style={{
                        alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                        maxWidth: '85%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start'
                    }}>
                        {msg.content && (
                            <div style={{
                                padding: '12px 16px',
                                borderRadius: '12px',
                                backgroundColor: msg.role === 'user' ? 'var(--bg-bubble-user, #007AFF)' : 'var(--bg-bubble-assistant, #E9E9EB)',
                                color: msg.role === 'user' ? 'var(--text-bubble-user, white)' : 'var(--text-bubble-assistant, black)',
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word'
                            }}>
                                {renderMessageContent(msg.content)}
                            </div>
                        )}
                        {msg.attachment && renderAttachment(msg.attachment)}
                    </div>
                ))}
                {isProcessing && (
                    <div style={{ alignSelf: 'flex-start', color: '#888', fontStyle: 'italic', paddingLeft: '10px' }}>
                        Thinking...
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div style={{
                padding: '20px',
                borderTop: '1px solid var(--border-color)',
                display: 'flex',
                gap: '10px',
                alignItems: 'flex-end',
                backgroundColor: 'var(--bg-primary)',
                position: 'sticky',
                bottom: 0,
                zIndex: 10,
                paddingBottom: 'calc(20px + encodeURIComponent(env(safe-area-inset-bottom)))'
            }}>
                <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    tabIndex={-1}
                    onClick={handleMicClick}
                    style={{
                        padding: '12px',
                        borderRadius: '50%',
                        border: 'none',
                        backgroundColor: isListening ? '#ff4444' : (voiceError ? '#ffcccc' : 'var(--bg-secondary)'),
                        color: isListening ? 'white' : 'var(--text-primary)',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        position: 'relative'
                    }}
                    title={voiceError || (isListening ? "Stop Listening" : "Start Voice Input")}
                >
                    🎤
                    {voiceError && (
                        <div style={{
                            position: 'absolute',
                            bottom: '100%',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            backgroundColor: 'red',
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '10px',
                            whiteSpace: 'nowrap',
                            marginBottom: '5px'
                        }}>
                            !
                        </div>
                    )}
                </button>

                <textarea
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    style={{
                        flex: 1,
                        padding: '12px',
                        borderRadius: '20px',
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--bg-secondary)',
                        color: 'var(--text-primary)',
                        resize: 'none',
                        minHeight: '45px',
                        maxHeight: '150px',
                        fontFamily: 'inherit'
                    }}
                    rows={1}
                />

                <button
                    type="button"
                    onClick={handleSend}
                    disabled={!inputValue.trim() || isProcessing}
                    style={{
                        padding: '12px 20px',
                        borderRadius: '20px',
                        border: 'none',
                        backgroundColor: 'var(--accent-primary)',
                        color: 'white',
                        fontWeight: 'bold',
                        cursor: inputValue.trim() && !isProcessing ? 'pointer' : 'not-allowed',
                        opacity: inputValue.trim() && !isProcessing ? 1 : 0.5
                    }}
                >
                    Send
                </button>
            </div>
        </div>
    );
};
