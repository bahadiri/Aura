import React from 'react';
import styles from '../../styles/aur.module.css';

interface ViewProps {
    prompt?: string;
    title: string;
    isLoading?: boolean;
    loadingText: string;
    copied: boolean;
    onCopy: () => void;
}

export const View: React.FC<ViewProps> = ({
    prompt,
    title,
    isLoading,
    loadingText,
    copied,
    onCopy
}) => {
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
            {title && <div className={styles.aurSectionTitle}>{title}</div>}

            <div className={styles.scrollArea}>
                <div className={styles.promptDisplay}>
                    {prompt || "No prompt generated yet."}
                </div>
            </div>

            <div className={styles.buttonArea}>
                <button
                    className={`${styles.copyButton} ${copied ? styles.copied : ''}`}
                    onClick={onCopy}
                    disabled={!prompt}
                >
                    {copied ? 'Copied!' : 'Copy Prompt'}
                </button>
            </div>
        </div>
    );
};
