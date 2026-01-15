import React from 'react';
import styles from '../../styles/aur.module.css';

interface ViewProps {
    value: string;
    setValue: (val: string) => void;
    placeholder: string;
    title?: string;
    isPolishing?: boolean;
    isGeneratingTitle?: boolean;
    onPolish?: () => void;
    onDownload?: () => void;
}

export const View: React.FC<ViewProps> = ({
    value,
    setValue,
    placeholder,
    title,
    isPolishing = false,
    isGeneratingTitle = false,
    onPolish,
    onDownload
}) => {
    return (
        <div className={styles.screenContent} style={{ padding: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Title Header */}
            {title && (
                <div style={{
                    padding: '12px 20px',
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(0,0,0,0.1)',
                    fontWeight: 600,
                    fontSize: '1.1rem',
                    color: 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    📝 {title}
                    {isGeneratingTitle && (
                        <span style={{ fontSize: '0.7rem', opacity: 0.5 }}>...</span>
                    )}
                </div>
            )}

            {/* Toolbar */}
            <div style={{
                padding: '8px 12px',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                gap: '8px',
                justifyContent: 'flex-end',
                background: 'rgba(0,0,0,0.2)',
                flexShrink: 0
            }}>
                <button
                    className={styles.actionButton}
                    onClick={onPolish}
                    disabled={isPolishing}
                    style={{ fontSize: '0.8rem', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 6 }}
                    title="Polish with Gemini"
                >
                    {isPolishing ? 'Wait...' : '✨ Polish'}
                </button>
                <button
                    className={styles.actionButton}
                    onClick={onDownload}
                    style={{ fontSize: '0.8rem', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 6 }}
                    title="Download as Markdown"
                >
                    💾 Save
                </button>
            </div>

            <textarea
                className={styles.noteArea}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={placeholder}
                style={{
                    flex: 1,
                    resize: 'none',
                    border: 'none',
                    outline: 'none',
                    padding: '30px',
                    lineHeight: '1.8',
                    fontSize: '1rem',
                    fontFamily: 'inherit'
                }}
            />
        </div>
    );
};
