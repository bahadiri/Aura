import React, { useState, useEffect } from 'react';
import { getStorage } from '../storage';
import { AuraProject } from '../sdk';

interface SidebarProps {
    isOpen: boolean;
    toggle: () => void;
    currentChatId?: string;
    onSelectChat: (id: string) => void;
    onNewChat: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggle, currentChatId, onSelectChat, onNewChat }) => {
    const [chats, setChats] = useState<AuraProject[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchChats = async () => {
        try {
            const storage = getStorage();
            const list = await storage.documents.list<AuraProject>('projects');
            // Sort by updated_at desc
            list.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
            setChats(list);
        } catch (err) {
            console.error("[Sidebar] Failed to fetch chats", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchChats();

        // Polling or listening to flux events could be better, 
        // but for now let's just refresh every 10s or when currentChatId changes
        const interval = setInterval(fetchChats, 10000);
        return () => clearInterval(interval);
    }, [currentChatId]);

    return (
        <div style={{
            width: isOpen ? 280 : 60,
            height: '100%',
            backgroundColor: 'var(--bg-sidebar)',
            borderRight: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            transition: 'width 0.3s ease',
            zIndex: 100,
            position: 'relative'
        }}>
            {/* Toggle Header */}
            <div style={{
                height: '60px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: isOpen ? 'space-between' : 'center',
                padding: isOpen ? '0 16px' : '0',
                borderBottom: '1px solid var(--border-subtle)',
                backgroundColor: 'rgba(0, 0, 0, 0.02)'
            }}>
                {isOpen && <span style={{ fontWeight: 700, whiteSpace: 'nowrap', fontSize: '1.1rem', color: 'var(--text-primary)' }}>Aura Space</span>}
                <button
                    onClick={toggle}
                    title={isOpen ? "Collapse Sidebar" : "Expand Sidebar"}
                    style={{
                        background: isOpen ? 'transparent' : 'var(--accent-primary, #646cff)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '8px',
                        color: isOpen ? 'var(--text-primary)' : '#fff',
                        cursor: 'pointer',
                        fontSize: '1.4rem',
                        width: '36px',
                        height: '36px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease',
                        boxShadow: isOpen ? 'none' : '0 4px 12px rgba(0,0,0,0.3)'
                    }}>
                    {isOpen ? '«' : '»'}
                </button>
            </div>

            {/* Content Area */}
            {isOpen && (
                <>
                    <div style={{ padding: '20px', borderBottom: '1px solid var(--border-subtle)' }}>
                        <button
                            onClick={onNewChat}
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '12px',
                                backgroundColor: 'var(--accent-primary)',
                                color: 'white',
                                border: 'none',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px'
                            }}
                        >
                            <span>+</span> New Chat
                        </button>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
                        {loading && <div style={{ padding: '20px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Loading...</div>}
                        {!loading && chats.length === 0 && <div style={{ padding: '20px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No chats yet</div>}
                        {chats.map(chat => (
                            <div
                                key={chat.id}
                                onClick={() => onSelectChat(chat.id)}
                                style={{
                                    padding: '12px 16px',
                                    margin: '4px 0',
                                    borderRadius: '10px',
                                    cursor: 'pointer',
                                    backgroundColor: currentChatId === chat.id ? 'var(--bg-highlight)' : 'transparent',
                                    color: currentChatId === chat.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                                    fontSize: '0.9rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    transition: 'all 0.2s',
                                    fontWeight: currentChatId === chat.id ? 600 : 400
                                }}
                            >
                                <span style={{ opacity: 0.5 }}>💬</span>
                                <span style={{
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    flex: 1
                                }}>
                                    {chat.name}
                                </span>
                                {currentChatId === chat.id && (
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const newName = window.prompt('New chat name:', chat.name);
                                                if (newName) {
                                                    const storage = getStorage();
                                                    storage.documents.update('projects', chat.id, { name: newName }).then(() => fetchChats());
                                                }
                                            }}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                fontSize: '0.8rem',
                                                padding: '4px',
                                                borderRadius: '4px',
                                                opacity: 0.6
                                            }}
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (window.confirm('Delete this chat?')) {
                                                    const storage = getStorage();
                                                    storage.documents.delete('projects', chat.id).then(() => fetchChats());
                                                }
                                            }}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                fontSize: '0.8rem',
                                                padding: '4px',
                                                borderRadius: '4px',
                                                opacity: 0.6
                                            }}
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* Collapsed Vertical Text */}
            {!isOpen && (
                <div
                    onClick={toggle}
                    style={{
                        padding: '20px 0',
                        color: 'var(--text-secondary)',
                        fontSize: '12px',
                        fontWeight: 600,
                        letterSpacing: '2px',
                        writingMode: 'vertical-rl',
                        textOrientation: 'mixed',
                        textTransform: 'uppercase',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        userSelect: 'none'
                    }}
                >
                    CHATS
                </div>
            )}
        </div>
    );
};
