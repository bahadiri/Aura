import React, { useState } from 'react';
import styles from '../../styles/aur.module.css';
import { Episode } from './model';

interface ViewProps {
    mode?: 'series' | 'movie';
    seriesTitle?: string;
    moviePlot?: string;
    displayPrompt?: string;
    isSearching?: boolean;
    episodes: Episode[];
    loadingMap: Record<string, boolean>;
    onExpandSummary: (ep: Episode) => void;
    expandPlot: (q: string, text: string) => void;
    expanding: boolean;
}

export const View: React.FC<ViewProps> = ({
    mode = 'series',
    seriesTitle,
    moviePlot,
    displayPrompt,
    isSearching,
    episodes,
    loadingMap,
    onExpandSummary,
    expandPlot,
    expanding
}) => {
    return (
        <div className={styles.screenContent}>
            <div className={styles.aurSectionTitle} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{seriesTitle || "UNKNOWN TITLE"} - {mode === 'movie' ? 'PLOT' : 'EPISODES'}</span>
            </div>

            {/* Prompt Section */}
            {displayPrompt && (
                <div style={{
                    background: 'var(--bg-highlight)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 8,
                    padding: 10,
                    marginBottom: 15,
                    fontSize: '0.9rem',
                    color: 'var(--text-primary)'
                }}>
                    <strong style={{ color: 'var(--accent-primary)' }}>Prompt:</strong> {displayPrompt}
                </div>
            )}

            <div className={styles.scrollArea}>
                {mode === 'movie' ? (
                    <div className={styles.listContainer}>
                        {isSearching || expanding ? (
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: 40
                            }}>
                                <div className={styles.hourglass}></div>
                                <p style={{ marginTop: 12, opacity: 0.6, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                    {expanding ? "Expanding Plot..." : "Searching Plot..."}
                                </p>
                            </div>
                        ) : (
                            <div className={styles.listItem} style={{
                                cursor: 'default',
                                position: 'relative'
                            }}>
                                <div style={{
                                    fontSize: '1rem',
                                    lineHeight: '1.6',
                                    color: 'var(--text-primary)',
                                    whiteSpace: 'pre-wrap'
                                }}>
                                    {moviePlot || "No plot synopsis available."}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className={styles.listContainer}>
                        {episodes.map(ep => {
                            const isLoading = loadingMap[ep.id];
                            return (
                                <div key={ep.id} className={styles.listItem} style={{ cursor: 'default' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <strong style={{ color: 'var(--accent-primary)' }}>S{ep.season} E{ep.episode}</strong>
                                            <span style={{ marginLeft: 8, color: 'var(--text-primary)' }}>{ep.title}</span>
                                            {ep.air_date && <span style={{ opacity: 0.5, fontSize: '0.8rem', marginLeft: 8, color: 'var(--text-secondary)' }}>({ep.air_date})</span>}
                                        </div>
                                        <button
                                            onClick={() => onExpandSummary(ep)}
                                            className={styles.actionButton}
                                            style={{ fontSize: '0.75rem', padding: '4px 10px', marginTop: 0, background: 'var(--bg-highlight)' }}
                                            disabled={isLoading}
                                        >
                                            {isLoading ? '...' : (ep.summary ? 'Refetch' : 'Summary')}
                                        </button>
                                    </div>

                                    {/* Collapsible Lazy Content */}
                                    {ep.summary && (
                                        <div style={{
                                            marginTop: 12,
                                            paddingTop: 12,
                                            borderTop: '1px solid var(--border-subtle)',
                                            fontSize: '0.9rem',
                                            opacity: 0.8,
                                            lineHeight: '1.5',
                                            color: 'var(--text-primary)'
                                        }}>
                                            {ep.summary}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};
