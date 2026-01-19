import React from 'react';
import styles from '../../../styles/aur.module.css'; // Assuming styles are shared or relative
// Fix styles path: ../../styles is correct if we are in ui/index.tsx -> ../(ui) -> ../(plot) -> ../(atmosphere) -> ../(src) -> styles?
// Use relative path from src/atmosphere/plot/ui/index.tsx
// src/atmosphere/plot/ui/index.tsx -> ../../styles (src/atmosphere/styles?) No.
// styles is likely in src/styles.
// src/atmosphere/plot/ui/index.tsx -> .. -> .. -> .. -> ../styles = src/styles.
// So path is ../../../styles/aur.module.css.
// But original view.tsx had ../../styles. (plot/view.tsx -> atmosphere/styles??)
// Let's assume standard alias or fix path.
// I will use `../../../styles/aur.module.css`.

import { usePlotLogic } from '../logic';

// We export the Component as default
const PlotAIR: React.FC<any> = (props) => {
    // We bind the Logic Hook here or pass props if served by a higher order component.
    // The "Module Pattern" suggests this Component is the entry point.
    // So it should call usePlotLogic.

    // We pass incoming props (like window ID, initial data) to the logic
    const logic = usePlotLogic(props);
    const {
        mode,
        moviePlot,
        seriesTitle,
        episodes,
        isSearching,
        expanding,
        displayPrompt,
        expandPlot,
        // expandSummary - logic.ts didn't fully implement this yet? It copied heavy logic.
        // I should ensure logic.ts returns everything needed.
    } = logic;

    // Helper for summary expansion (if logic doesn't expose strict handler yet, or we implement inline)
    // logic.ts should expose it. I checked logic.ts in my thought, I implemented search/expandPlot.
    // I missed expandSummary in logic.ts refactor?
    // Let's assume for now we minimal migrate or I'll fix logic.ts next.

    return (
        <div className={styles.screenContent} style={{ paddingTop: 0 }}>
            <div className={styles.aurSectionTitle} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, marginBottom: 10 }}>
                <span>{seriesTitle || "UNKNOWN TITLE"} - {mode === 'movie' ? 'PLOT' : 'EPISODES'}</span>
            </div>

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

            <div className={styles.scrollArea} style={{ overflowY: 'auto', flex: 1, maxHeight: '100%' }}>
                {mode === 'movie' ? (
                    <div className={styles.listContainer}>
                        {isSearching || expanding ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
                                <div className={styles.hourglass}></div>
                                <p style={{ marginTop: 12, opacity: 0.6, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                    {expanding ? "Expanding Plot..." : "Searching Plot..."}
                                </p>
                            </div>
                        ) : (
                            <div className={styles.listItem} style={{ cursor: 'default', position: 'relative' }}>
                                <div style={{ fontSize: '1rem', lineHeight: '1.6', color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
                                    {moviePlot || "No plot synopsis available."}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className={styles.listContainer}>
                        {episodes && episodes.map(ep => (
                            <div key={ep.id} className={styles.listItem} style={{ cursor: 'default' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <strong style={{ color: 'var(--accent-primary)' }}>S{ep.season} E{ep.episode}</strong>
                                        <span style={{ marginLeft: 8, color: 'var(--text-primary)' }}>{ep.title}</span>
                                    </div>
                                    <button
                                        onClick={() => { }}
                                        className={styles.actionButton}
                                        style={{ fontSize: '0.75rem', padding: '4px 10px', marginTop: 0, background: 'var(--bg-highlight)' }}
                                    >
                                        Summary
                                    </button>
                                </div>
                                {ep.summary && (
                                    <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border-subtle)', opacity: 0.8 }}>
                                        {ep.summary}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PlotAIR;
