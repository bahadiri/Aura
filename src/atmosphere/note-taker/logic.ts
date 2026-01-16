import { useState, useEffect } from 'react';
import { useAura } from '../../sdk';
import { resources } from './resources';

export interface UseNoteTakerProps {
    initialValue?: string;
    placeholder?: string;
    updateWindow?: (data: any) => void;
    title?: string;
    content?: string; // For appending new content
    updateTs?: number; // Timestamp to trigger append
}

export const useNoteTakerLogic = ({ initialValue = '', updateWindow, title: initialTitle, content, updateTs }: UseNoteTakerProps) => {
    const { llm } = useAura(); // Using LLM for polish/title

    const [value, setValue] = useState(initialValue || '* ');
    const [isPolishing, setIsPolishing] = useState(false);
    const [title, setTitle] = useState(initialTitle || '');
    const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);

    // Handle content appending (for chat-driven note additions)
    useEffect(() => {
        if (content && updateTs) {
            setValue(prev => {
                const trimmed = prev.trim();
                // Append with newline if existing content
                if (trimmed && trimmed !== '*') {
                    return `${prev}\n${content}`;
                }
                return content;
            });
        }
    }, [content, updateTs]);

    // Persistence
    useEffect(() => {
        if (updateWindow) {
            const timeoutId = setTimeout(() => {
                updateWindow({ props: { initialValue: value, title } });
            }, 1000);
            return () => clearTimeout(timeoutId);
        }
    }, [value, title, updateWindow]);

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
