import React from 'react';
import { usePrompt } from './model';
import { View } from './view';

export interface PromptAIRProps {
    prompt?: string;
    title?: string;
    onCopy?: () => void;
    isLoading?: boolean;
    loadingText?: string;
}

export const PromptAIR: React.FC<PromptAIRProps> = ({
    prompt,
    title = "Final Prompt",
    onCopy,
    isLoading,
    loadingText = "Generating..."
}) => {
    const { copied, handleCopy } = usePrompt({ prompt, onCopy });

    return (
        <View
            prompt={prompt}
            title={title}
            isLoading={isLoading}
            loadingText={loadingText}
            copied={copied}
            onCopy={handleCopy}
        />
    );
};
