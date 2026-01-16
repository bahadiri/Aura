
import React, { useState } from 'react';
import styles from '../../../styles/aur.module.css';

export interface Character {
    id: string | number;
    name: string;
    role: string;
    imageUrl?: string;
    description?: string;
    traits?: string[];
}

export interface CharactersUIProps {
    title: string;
    characters: Character[];
    isLoading?: boolean;
    error?: string;
    onSelect?: (char: Character) => void;
    updateWindow?: (data: any) => void;
}

const CharactersUI: React.FC<CharactersUIProps> = ({
    title,
    characters,
    isLoading,
    error,
    onSelect
}) => {
    // We no longer have a "selectedChar" state, as all info is shown inline.
    // However, onSelect prop can still be triggered if we want interactions.

    return (
        <div className={styles.screenContent}>
            <div className={styles.aurSectionTitle}>{title}</div>

            {isLoading && (
                <div style={{ position: 'absolute', top: 60, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-overlay, rgba(0,0,0,0.5))', zIndex: 10 }}>
                    <div className={styles.hourglass}></div>
                    <p style={{ marginTop: 12, opacity: 0.6, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Gathering cast...</p>
                </div>
            )}

            {error && (
                <div style={{ padding: 20, textAlign: 'center', opacity: 0.6 }}>
                    <p style={{ color: 'var(--text-secondary)' }}>⚠️ {error}</p>
                </div>
            )}

            <div className={styles.scrollArea}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 15, padding: '0 5px' }}>
                    {characters.map(char => (
                        <div
                            key={char.id}
                            style={{
                                background: 'var(--bg-secondary)',
                                borderRadius: 16,
                                padding: 16,
                                border: '1px solid var(--border-subtle)',
                                display: 'flex',
                                flexDirection: 'row',
                                gap: 20,
                                alignItems: 'flex-start',
                                transition: 'all 0.2s',
                                minHeight: 120
                            }}
                        >
                            {/* Left Column: Image & Basic Info */}
                            <div style={{ flex: '0 0 180px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                    {/* Avatar Image */}
                                    <div style={{
                                        width: 60,
                                        height: 60,
                                        borderRadius: '50%',
                                        overflow: 'hidden',
                                        flexShrink: 0,
                                        background: 'var(--bg-tertiary)',
                                        border: '1px solid var(--border-subtle)'
                                    }}>
                                        {char.imageUrl ? (
                                            <img src={char.imageUrl} alt={char.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600 }}>
                                                {char.name.charAt(0)}
                                            </div>
                                        )}
                                    </div>

                                    {/* Name & Actor */}
                                    <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                                        <div style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{char.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{char.role}</div>
                                    </div>
                                </div>

                                {/* Tags */}
                                {char.traits && char.traits.length > 0 && (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                        {char.traits.slice(0, 3).map((t, i) => ( // Showing top 3 tags
                                            <span key={`${t}-${i}`} style={{
                                                fontSize: '0.65rem',
                                                padding: '3px 8px',
                                                background: 'var(--bg-highlight)',
                                                borderRadius: 12,
                                                color: 'var(--text-secondary)',
                                                border: '1px solid var(--border-subtle)'
                                            }}>
                                                {t}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Right Column: Description */}
                            <div style={{
                                flex: 1,
                                fontSize: '0.9rem',
                                lineHeight: '1.6',
                                color: 'var(--text-primary)',
                                opacity: 0.9,
                                borderLeft: '1px solid var(--border-subtle)',
                                paddingLeft: 20,
                                display: 'flex',
                                alignItems: 'center'
                            }}>
                                {char.description ? (
                                    <span>{char.description}</span>
                                ) : (
                                    <span style={{ fontStyle: 'italic', opacity: 0.5, color: 'var(--text-secondary)' }}>
                                        Analyzing character...
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CharactersUI;
