import React, { useState, useEffect, useCallback } from 'react';
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

    // UI State for context menu and renaming
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
    const [renamingId, setRenamingId] = useState<string | null>(null);
    const [renamingValue, setRenamingValue] = useState("");

    const fetchChats = useCallback(async () => {
        try {
            const storage = getStorage();
            const list = await storage.documents.list<AuraProject>('projects');
            // Sort: Pinned first, then by updated_at desc
            list.sort((a, b) => {
                if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
                return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
            });
            setChats(list);
        } catch (err) {
            console.error("[Sidebar] Failed to fetch chats", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchChats();
        const interval = setInterval(fetchChats, 10000);
        return () => clearInterval(interval);
    }, [currentChatId, fetchChats]);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClick = () => setActiveMenuId(null);
        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, []);

    const handleAction = async (e: React.MouseEvent, type: 'pin' | 'delete' | 'rename', chat: AuraProject) => {
        e.stopPropagation();
        const storage = getStorage();

        if (type === 'delete') {
            // Optimistic delete
            setChats(prev => prev.filter(c => c.id !== chat.id));
            setActiveMenuId(null);
            try {
                await storage.documents.delete('projects', chat.id);
                fetchChats();
            } catch (err) {
                console.error("[Sidebar] Delete failed", err);
                fetchChats(); // Revert on failure
            }
            return;
        }

        if (type === 'pin') {
            try {
                await storage.documents.update('projects', chat.id, { is_pinned: !chat.is_pinned });
                fetchChats();
            } catch (err) {
                console.error("[Sidebar] Pin toggle failed", err);
            }
            setActiveMenuId(null);
            return;
        }

        if (type === 'rename') {
            setRenamingId(chat.id);
            setRenamingValue(chat.name);
            setActiveMenuId(null);
            return;
        }
    };

    const submitRename = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!renamingId) return;
        try {
            const storage = getStorage();
            await storage.documents.update('projects', renamingId, { name: renamingValue });
            setRenamingId(null);
            fetchChats();
        } catch (err) {
            console.error("[Sidebar] Rename failed", err);
        }
    };

    const pinnedChats = chats.filter(c => c.is_pinned);
    const recentChats = chats.filter(c => !c.is_pinned);

    const renderChatItem = (chat: AuraProject) => {
        const isRenaming = renamingId === chat.id;
        const isActive = currentChatId === chat.id;
        const isMenuOpen = activeMenuId === chat.id;

        return (
            <div
                key={chat.id}
                onClick={() => !isRenaming && onSelectChat(chat.id)}
                style={{
                    padding: '10px 12px',
                    margin: '2px 0',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    backgroundColor: isActive || isMenuOpen ? 'var(--bg-highlight)' : 'transparent',
                    color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    transition: 'all 0.2s',
                    fontWeight: isActive ? 600 : 400,
                    position: 'relative'
                }}
                onMouseOver={(e) => { if (!isMenuOpen) e.currentTarget.style.backgroundColor = 'var(--bg-highlight)'; }}
                onMouseOut={(e) => { if (!isMenuOpen && !isActive) e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
                <span style={{ opacity: 0.5 }}>{chat.is_pinned ? '📌' : '💬'}</span>

                {isRenaming ? (
                    <form onSubmit={submitRename} onClick={e => e.stopPropagation()} style={{ flex: 1 }}>
                        <input
                            autoFocus
                            value={renamingValue}
                            onChange={e => setRenamingValue(e.target.value)}
                            onBlur={() => submitRename()}
                            style={{
                                background: 'var(--bg-input)',
                                border: '1px solid var(--border-subtle)',
                                color: 'var(--text-primary)',
                                width: '100%',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                outline: 'none',
                                fontSize: '0.9rem'
                            }}
                        />
                    </form>
                ) : (
                    <>
                        <span style={{
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            flex: 1
                        }}>{chat.name}</span>

                        {/* Three-dot menu button */}
                        <button
                            onClick={(e) => { e.stopPropagation(); setActiveMenuId(isMenuOpen ? null : chat.id); }}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--text-secondary)',
                                cursor: 'pointer',
                                padding: '2px 6px',
                                opacity: isMenuOpen || isActive ? 1 : 0.4,
                                fontSize: '1rem',
                                borderRadius: '4px'
                            }}
                        >
                            ⋮
                        </button>
                    </>
                )}

                {/* Dropdown Menu */}
                {isMenuOpen && (
                    <div style={{
                        position: 'absolute',
                        top: '100%',
                        right: 0,
                        backgroundColor: 'var(--bg-sidebar)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '10px',
                        padding: '6px',
                        zIndex: 1000,
                        boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                        minWidth: '130px',
                        marginTop: '4px'
                    }}>
                        {[
                            { label: chat.is_pinned ? 'Unpin' : 'Pin', icon: '📌', type: 'pin' as const },
                            { label: 'Rename', icon: '✏️', type: 'rename' as const },
                            { label: 'Delete', icon: '🗑️', type: 'delete' as const },
                        ].map(item => (
                            <div
                                key={item.type}
                                onClick={(e) => handleAction(e, item.type, chat)}
                                style={{
                                    padding: '8px 12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    borderRadius: '6px',
                                    fontSize: '0.85rem',
                                    color: item.type === 'delete' ? 'var(--error-color, #e74c3c)' : 'var(--text-primary)',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.2s'
                                }}
                                onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--bg-highlight)'}
                                onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                                <span>{item.icon}</span>
                                <span>{item.label}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div style={{
            width: isOpen ? 240 : 0,
            minWidth: isOpen ? 240 : 0,
            height: '100%',
            backgroundColor: 'var(--bg-sidebar)',
            borderRight: isOpen ? '1px solid var(--border-subtle)' : 'none',
            display: 'flex',
            flexDirection: 'column',
            transition: 'width 0.3s ease, min-width 0.3s ease',
            zIndex: 100,
            position: 'relative',
            overflow: isOpen ? 'visible' : 'hidden'
        }}>
            {/* Toggle Header - Only shown when open */}
            {isOpen && (
                <div style={{
                    height: '60px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 16px',
                    borderBottom: '1px solid var(--border-subtle)',
                    backgroundColor: 'rgba(0, 0, 0, 0.02)'
                }}>
                    <span style={{ fontWeight: 700, whiteSpace: 'nowrap', fontSize: '1.1rem', color: 'var(--text-primary)' }}>Aura Space</span>
                    <button
                        onClick={toggle}
                        title="Collapse Sidebar"
                        style={{
                            background: 'transparent',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: '8px',
                            color: 'var(--text-primary)',
                            cursor: 'pointer',
                            fontSize: '1.4rem',
                            width: '36px',
                            height: '36px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s ease'
                        }}>
                        «
                    </button>
                </div>
            )}

            {/* Content Area */}
            {isOpen && (
                <>
                    <div style={{ padding: '16px', borderBottom: '1px solid var(--border-subtle)' }}>
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
                                gap: '8px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                            }}
                        >
                            <span>+</span> New Chat
                        </button>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
                        {loading && <div style={{ padding: '20px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Loading...</div>}

                        {!loading && chats.length === 0 && (
                            <div style={{ padding: '20px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No chats yet</div>
                        )}

                        {/* Pinned Section */}
                        {pinnedChats.length > 0 && (
                            <div style={{ marginBottom: '16px' }}>
                                <div style={{
                                    fontSize: '0.7rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px',
                                    color: 'var(--text-tertiary)',
                                    marginBottom: '8px',
                                    padding: '0 12px',
                                    fontWeight: 600
                                }}>
                                    Pinned
                                </div>
                                {pinnedChats.map(renderChatItem)}
                            </div>
                        )}

                        {/* Recent Section */}
                        {recentChats.length > 0 && (
                            <div>
                                <div style={{
                                    fontSize: '0.7rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px',
                                    color: 'var(--text-tertiary)',
                                    marginBottom: '8px',
                                    padding: '0 12px',
                                    fontWeight: 600
                                }}>
                                    Recent
                                </div>
                                {recentChats.map(renderChatItem)}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};
