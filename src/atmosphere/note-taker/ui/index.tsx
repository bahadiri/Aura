import React from 'react';
import styles from '../../../styles/aur.module.css';

export interface NoteTakerUIProps {
    value: string;
    setValue: (val: string) => void;
    placeholder?: string;
    title?: string;
    isPolishing?: boolean;
    isGeneratingTitle?: boolean;
    onPolish?: () => void;
    onDownload?: () => void;
}

const NoteTakerUI: React.FC<NoteTakerUIProps> = ({
    value,
    setValue,
    placeholder = "Start typing...",
    title,
    isPolishing = false,
    isGeneratingTitle = false,
    onPolish,
    onDownload
}) => {
    return (
        <div className={styles.screenContent} style={{ padding: 0, display: 'flex', flexDirection: 'column' }}>
            {/* Title Header */}
            {title && (
                <div style={{
                    padding: '12px 20px',
                    borderBottom: '1px solid var(--border-subtle)',
                    background: 'var(--bg-secondary)',
                    fontWeight: 600,
                    fontSize: '1.1rem',
                    color: 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    📝 {title}
                    {isGeneratingTitle && (
                        <span style={{ fontSize: '0.7rem', opacity: 0.5 }}>Generating title...</span>
                    )}
                </div>
            )}

            {/* Toolbar */}
            <div style={{
                padding: '8px 12px',
                borderBottom: '1px solid var(--border-subtle)',
                display: 'flex',
                gap: '8px',
                justifyContent: 'flex-end',
                background: 'var(--bg-secondary)',
                flexShrink: 0
            }}>
                <button
                    className={styles.actionButton}
                    onClick={onPolish}
                    disabled={isPolishing || !value.trim()}
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
                    fontFamily: 'inherit',
                    background: 'transparent',
                    color: 'var(--text-primary)'
                }}
            />
        </div>
    );
};

export default NoteTakerUI;
