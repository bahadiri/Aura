import { useState, useEffect } from 'react';

export interface PromptAIRProps {
    prompt?: string;
    title?: string;
    onCopy?: () => void;
    isLoading?: boolean;
    loadingText?: string;
}

export const usePrompt = (props: PromptAIRProps) => {
    const [copied, setCopied] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 800); // Brief "magical" loading
        return () => clearTimeout(timer);
    }, []);

    const handleCopy = () => {
        if (props.prompt) {
            navigator.clipboard.writeText(props.prompt);
            setCopied(true);
            if (props.onCopy) props.onCopy();
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return {
        ...props,
        isLoading: props.isLoading || loading,
        loadingText: props.loadingText || "Decrypting Aura Summary...",
        copied,
        handleCopy
    };
};
