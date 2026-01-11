
import React, { useState } from 'react';
import styles from './AURs.module.css';

export interface PromptAURProps {
    prompt: string;
    title?: string;
    onCopy?: () => void;
    isLoading?: boolean;
    loadingText?: string;
}

export const PromptAUR: React.FC<PromptAURProps> = ({
    prompt,
    title = "Final Prompt",
    onCopy,
    isLoading,
    loadingText = "Generating..."
}) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(prompt);
        setCopied(true);
        if (onCopy) onCopy();
        setTimeout(() => setCopied(false), 2000);
    };

    if (isLoading) {
        return (
            <div className={styles.screenContent} style={{ justifyContent: 'center', alignItems: 'center' }}>
                <div className={styles.hourglass}></div>
                <p style={{ marginTop: 12, opacity: 0.6 }}>{loadingText}</p>
            </div>
        );
    }

    return (
        <div className={styles.screenContent}>
            <div className={styles.aurSectionTitle}>{title}</div>

            <div className={styles.scrollArea}>
                <div className={styles.promptDisplay}>
                    {prompt || "No prompt generated yet."}
                </div>
            </div>

            <div className={styles.buttonArea}>
                <button
                    className={`${styles.copyButton} ${copied ? styles.copied : ''}`}
                    onClick={handleCopy}
                    disabled={!prompt}
                >
                    {copied ? 'Copied!' : 'Copy Prompt'}
                </button>
            </div>
        </div>
    );
};
