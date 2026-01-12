import React from 'react';
import styles from '../../styles/aur.module.css';
import { Episode } from './model';

interface ViewProps {
    seriesTitle: string;
    displayPrompt: string;
    episodes: Episode[];
    loadingMap: Record<string, boolean>;
    onExpandSummary: (ep: Episode) => void;
}

export const View: React.FC<ViewProps> = ({
    seriesTitle,
    displayPrompt,
    episodes,
    loadingMap,
    onExpandSummary
}) => {
    return (
        <div className={styles.screenContent}>
            <div className={styles.aurSectionTitle}>{seriesTitle} - EPISODES</div>

            {/* Prompt Section */}
            <div style={{
                background: 'rgba(76, 201, 240, 0.1)',
                border: '1px solid rgba(76, 201, 240, 0.3)',
                borderRadius: 8,
                padding: 10,
                marginBottom: 15,
                fontSize: '0.9rem'
            }}>
                <strong style={{ color: '#4cc9f0' }}>Prompt:</strong> {displayPrompt}
            </div>

            <div className={styles.scrollArea}>
                <div className={styles.listContainer}>
                    {episodes.map(ep => {
                        const isLoading = loadingMap[ep.id];
                        return (
                            <div key={ep.id} className={styles.listItem} style={{ cursor: 'default' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <strong>S{ep.season}E{ep.episode}:</strong> {ep.title}
                                    </div>
                                    <button
                                        onClick={() => onExpandSummary(ep)}
                                        className={styles.actionButton}
                                        style={{ fontSize: '0.8rem', padding: '4px 8px', marginTop: 0 }}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? '...' : (ep.summary ? 'Reload' : 'Summary')}
                                    </button>
                                </div>

                                {/* Collapsible Lazy Content */}
                                {ep.summary && (
                                    <div style={{
                                        marginTop: 10,
                                        paddingTop: 10,
                                        borderTop: '1px solid rgba(255,255,255,0.1)',
                                        fontSize: '0.9rem',
                                        opacity: 0.8,
                                        fontStyle: 'italic'
                                    }}>
                                        {ep.summary}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
