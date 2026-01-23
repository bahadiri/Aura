import { useState, useEffect } from 'react';
import { useAura } from '../../sdk';
import { resources } from './resources';
import { getStorage } from '../../storage';
import { flux } from '../../flux';

export interface UseNoteTakerProps {
    initialValue?: string;
    placeholder?: string;
    updateWindow?: (data: any) => void;
    title?: string;
    content?: string; // For appending new content
    updateTs?: number; // Timestamp to trigger append
}

export const useNoteTakerLogic = ({ initialValue = '', updateWindow, title: initialTitle, content, updateTs }: UseNoteTakerProps) => {
    const { llm, sessionId } = useAura(); // Get sessionId for storage

    const [value, setValue] = useState(initialValue || '* ');
    const [isPolishing, setIsPolishing] = useState(false);
    const [title, setTitle] = useState(initialTitle || '');
    const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);

    // Session Persistence Consts
    const COLLECTION = `notes_${sessionId || 'default'}`;
    const DOC_ID = 'main_note';

    // Load from Utils
    const loadFromStorage = async (): Promise<{ value: string; title: string } | null> => {
        try {
            const doc = await getStorage().documents.get(COLLECTION, DOC_ID);
            return doc as any;
        } catch (e) {
            return null;
        }
    };

    // Initial Load
    useEffect(() => {
        let mounted = true;
        loadFromStorage().then(data => {
            if (mounted && data) {
                if (data.value) setValue(data.value);
                if (data.title) setTitle(data.title);
            }
        });
        return () => { mounted = false; };
    }, [sessionId]);

    const persist = async (newValue: string, newTitle: string) => {
        try {
            const exists = await getStorage().documents.get(COLLECTION, DOC_ID);
            if (exists) {
                await getStorage().documents.update(COLLECTION, DOC_ID, { value: newValue, title: newTitle });
            } else {
                await getStorage().documents.create(COLLECTION, { id: DOC_ID, value: newValue, title: newTitle });
            }
        } catch (e) {
            console.error("Persist failed", e);
        }
    };

    // Logic for Flux & Context
    useEffect(() => {
        if (!flux) return; // Safety check

        const unsubscribe = flux.subscribe((msg: any) => {
            // Context Provider
            if (msg.type === 'REQUEST_CONTEXT') {
                console.log("[NoteTaker] Broadcasting Context");
                flux.dispatch({
                    type: 'PROVIDE_CONTEXT',
                    payload: {
                        id: 'note-taker-air',
                        context: {
                            content: value,
                            lastUpdated: Date.now()
                        }
                    },
                    to: 'all'
                });
            }
        });
        return unsubscribe;
    }, [value]); // Re-subscribe when value changes to ensure context is fresh.

    // Handle content appending (for chat-driven note additions)
    useEffect(() => {
        if (content && updateTs) {
            setValue(prev => {
                const trimmed = prev.trim();
                let next = prev;
                // Append with newline if existing content
                if (trimmed && trimmed !== '*') {
                    next = `${prev}\n${content}`;
                } else {
                    next = content;
                }
                persist(next, title); // Persist immediately
                return next;
            });
        }
    }, [content, updateTs]);

    // Persistence on Change (Debounced)
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            persist(value, title);
            // Also sync back to window definition for Layout persistence (Project Scoped) if needed
            if (updateWindow) {
                updateWindow({ props: { initialValue: value, title } });
            }
        }, 1000);
        return () => clearTimeout(timeoutId);
    }, [value, title]);

    // Auto-Title
    useEffect(() => {
        const shouldGenerateTitle = !title && value.trim().length > 20 && !isGeneratingTitle;

        if (shouldGenerateTitle) {
            const timeoutId = setTimeout(() => {
                generateTitle();
            }, 2000);
            return () => clearTimeout(timeoutId);
        }
    }, [value, title]);

    const generateTitle = async () => {
        if (isGeneratingTitle || !value.trim()) return;
        setIsGeneratingTitle(true);
        try {
            const response = await llm.invoke(resources.ai.titler, {
                messages: [
                    { role: "system", content: resources.ai.titler.systemPrompt },
                    { role: "user", content: value.substring(0, 500) } // Send first 500 chars context
                ]
            });

            if (response.content) {
                const newTitle = response.content.replace(/["']/g, "").trim();
                setTitle(newTitle);
            }
        } catch (e) {
            console.error("[NoteTaker] Title generation failed", e);
        } finally {
            setIsGeneratingTitle(false);
        }
    };

    const polishNotes = async () => {
        if (!value.trim() || value.length < 5) return;
        setIsPolishing(true);
        try {
            const response = await llm.invoke(resources.ai.editor, {
                messages: [
                    { role: "system", content: resources.ai.editor.systemPrompt },
                    { role: "user", content: value }
                ]
            });

            if (response.content) {
                setValue(response.content);
            }
        } catch (e) {
            console.error("[NoteTaker] Polish failed", e);
        } finally {
            setIsPolishing(false);
        }
    };

    const downloadNotes = () => {
        const blob = new Blob([value], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const filename = title ? `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md` : `aura-notes-${new Date().toISOString().slice(0, 10)}.md`;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return {
        value,
        setValue,
        title,
        isPolishing,
        isGeneratingTitle,
        polishNotes,
        downloadNotes
    };
};
