import { useState } from 'react';

export interface PromptAIRProps {
    prompt?: string;
    title?: string;
    onCopy?: () => void;
    isLoading?: boolean;
    loadingText?: string;
}

export const usePrompt = ({ prompt, onCopy }: PromptAIRProps) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        if (prompt) {
            navigator.clipboard.writeText(prompt);
            setCopied(true);
            if (onCopy) onCopy();
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return {
        copied,
        handleCopy
    };
};
