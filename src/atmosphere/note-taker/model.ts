import { useState, useEffect } from 'react';

export interface NoteTakerAIRProps {
    initialValue?: string;
    placeholder?: string;
    updateWindow?: (data: any) => void;
    title?: string;
}

export const useNoteTaker = ({ initialValue = '', updateWindow, title: initialTitle }: NoteTakerAIRProps) => {
    // Default to a bullet point if empty
    const [value, setValue] = useState(initialValue || '* ');
    const [isPolishing, setIsPolishing] = useState(false);
    const [title, setTitle] = useState(initialTitle || '');
    const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);

    // Persistence: Update window state when value or title changes (debounced)
    useEffect(() => {
        if (updateWindow) {
            const timeoutId = setTimeout(() => {
                updateWindow({ props: { initialValue: value, title } });
            }, 1000);
            return () => clearTimeout(timeoutId);
        }
    }, [value, title, updateWindow]);

    // Auto-generate title after first content (if no title exists)
    useEffect(() => {
        const shouldGenerateTitle = !title && value.trim().length > 10;

        if (shouldGenerateTitle) {
            const timeoutId = setTimeout(() => {
                generateTitle();
            }, 2000); // Debounce: wait 2s after user stops typing
            return () => clearTimeout(timeoutId);
        }
    }, [value, title]);

    const generateTitle = async () => {
        if (isGeneratingTitle || !value.trim()) return;

        setIsGeneratingTitle(true);
        try {
            const port = import.meta.env.VITE_SAGA_BACKEND_PORT || '8001';
            const baseUrl = import.meta.env.VITE_SAGA_API_URL || `http://localhost:${port}`;

            const res = await fetch(`${baseUrl}/api/notes/generate-title`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: value })
            });

            const data = await res.json();
            if (data.title) {
                setTitle(data.title);
            }
        } catch (error) {
            console.error("Failed to generate title:", error);
        } finally {
            setIsGeneratingTitle(false);
        }
    };

    const polishNotes = async () => {
        if (!value.trim() || value.length < 5) return;

        setIsPolishing(true);
        try {
            const port = import.meta.env.VITE_SAGA_BACKEND_PORT || '8001';
            const baseUrl = import.meta.env.VITE_SAGA_API_URL || `http://localhost:${port}`;

            const res = await fetch(`${baseUrl}/api/notes/polish`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: value })
            });

            const data = await res.json();
            if (data.content) {
                setValue(data.content);
            }
        } catch (error) {
            console.error("Failed to polish notes:", error);
        } finally {
            setIsPolishing(false);
        }
    };

    const downloadNotes = () => {
        const blob = new Blob([value], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const filename = title ? `${title.toLowerCase().replace(/\s+/g, '-')}.md` : `aura-notes-${new Date().toISOString().slice(0, 10)}.md`;
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
        setTitle,
        isPolishing,
        isGeneratingTitle,
        polishNotes,
        downloadNotes,
        generateTitle
    };
};
