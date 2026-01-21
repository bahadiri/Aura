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
        if (isListening) {
            setInputValue(transcript + interimTranscript);
        } else if (transcript) {
            setInputValue(transcript);
        }
    }, [transcript, interimTranscript, isListening]);

    // Auto-scroll logic: Only scroll if enabled and new message added OR user was already at bottom
    useEffect(() => {
        const container = messagesContainerRef.current?.parentElement || messagesContainerRef.current;
        if (!container || !autoScrollEnabled) {
            prevMessagesLength.current = messages.length;
            return;
        }

        const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 150;
        const isNewMessage = messages.length > prevMessagesLength.current;

        if (isNewMessage || isAtBottom) {
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

    // Track active AIRs (inline + Space)
    useEffect(() => {
        const inlineAIRs = messages
            .filter(m => m.attachment && !poppedOutIds.has(m.attachment.instanceId || ''))
            .map(m => m.attachment!.id);

        const spaceAIRs = controller.windows.map(w => w.manifestId);

        const allActive = Array.from(new Set([...inlineAIRs, ...spaceAIRs]));
        setActiveAIRs(allActive);
    }, [messages, controller.windows, poppedOutIds]);

    const handleSend = async () => {
        if (!inputValue.trim() || isProcessing) return;

        const text = inputValue;
        setInputValue('');
        resetTranscript(); // Clear voice buffer

        // Optimistic Update
        setMessages(prev => [...prev, { role: 'user', content: text }]);
        setIsProcessing(true);

        if (onSend) {
            onSend(text);
            // If onSend is provided, we assume parent handles everything else? 
            // Or do we still do reflection? 
            // Let's assume onSend is a side-effect hook, but core logic remains here for "Aura Chat".
        }

        // Emit CHAT_PROMPT for auto-naming feature
        flux.dispatch({
            type: 'CHAT_PROMPT',
            payload: { text },
            to: 'assistant'
        });

        try {
            // 1. REFLECTION STEP
            console.log("Reflecting on:", text);
            console.log("Active AIRs:", activeAIRs);
            const actions = await controller.reflect(text, messages, activeAIRs);

            let finalContent = '';

            // 2. INLINE ATTACHMENTS (Chat-First UX)
            if (actions && Array.isArray(actions) && actions.length > 0) {
                actions.forEach((action: any) => {
                    if (action.id === 'assistant') return;

                    // Handle append action for singleton AIRs (e.g. Note Taker)
                    // TODO: Make this generic via Manifest configuration (e.g. manifest.isSingleton)
                    if (action.action === 'append' && action.id === 'note-taker-air') {
                        // Check if it's inline (in chat messages)
                        const existingNoteIdx = messages.findIndex(
                            m => m.attachment?.id === 'note-taker-air' && !poppedOutIds.has(m.attachment.instanceId || '')
                        );

                        if (existingNoteIdx >= 0) {
                            // Update existing inline note
                            setMessages(prev => {
                                const updated = [...prev];
                                const current = updated[existingNoteIdx].attachment!.props.initialValue || '';
                                const newContent = action.props.content || '';
                                updated[existingNoteIdx].attachment!.props.initialValue =
                                    current + (current ? '\n' : '') + newContent;
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
                                        props: action.props // Contains content and updateTs
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
                    } else {
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
                    }
                });
            }

            // 3. TEXT RESPONSE (Assistant Message)
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
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
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

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Messages Area */}
            <div
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
                                {msg.content}
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
                    onClick={isListening ? stopListening : startListening}
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
