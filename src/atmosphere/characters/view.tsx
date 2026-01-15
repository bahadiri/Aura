import React from 'react';
import styles from '../../styles/aur.module.css';
import { Character } from './model';

interface ViewProps {
    title: string;
    characters: Character[];
    isLoading?: boolean;
    error?: string;
    onSelect: (char: Character) => void;
}

export const View: React.FC<ViewProps> = ({
    title,
    characters,
    isLoading,
    error,
    onSelect
}) => {
    return (
        <div className={styles.screenContent}>
            <div className={styles.aurSectionTitle}>{title}</div>

            {isLoading && (
                <div style={{ position: 'absolute', top: 60, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.2)', zIndex: 10 }}>
                    <div className={styles.hourglass}></div>
                    <p style={{ marginTop: 12, opacity: 0.6, fontSize: '0.8rem' }}>Gathering cast...</p>
                </div>
            )}

            {error && (
                <div style={{ padding: 20, textAlign: 'center', opacity: 0.6 }}>
                    <p>⚠️ {error}</p>
                </div>
            )}

            <div className={styles.scrollArea}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 15, padding: '0 5px' }}>
                    {characters.map(char => (
                        <div
                            key={char.id}
                            style={{
                                background: 'rgba(255,255,255,0.03)',
                                borderRadius: 12,
                                overflow: 'hidden',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                border: '1px solid rgba(255,255,255,0.05)',
                                display: 'flex',
                                flexDirection: 'column'
                            }}
                            onClick={() => onSelect(char)}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-4px)';
                                e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                            }}
                        >
                            <div style={{ height: 160, background: '#111', overflow: 'hidden', position: 'relative' }}>
                                {char.imageUrl ? (
                                    <img src={char.imageUrl} alt={char.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <div style={{
                                        width: '100%',
                                        height: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: 'linear-gradient(135deg, #1f1f1f 0%, #2d2d2d 100%)',
                                        color: 'rgba(255,255,255,0.15)',
                                        fontSize: '2rem',
                                        fontWeight: 600
                                    }}>
                                        {char.name.substring(0, 2).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <div style={{ padding: '12px 10px' }}>
                                {/* Character Name */}
                                <div style={{ fontWeight: '700', fontSize: '0.9rem', marginBottom: 4, lineHeight: '1.2' }}>{char.name}</div>

                                {/* Actor Name (Mapped from Role) */}
                                <div style={{ fontSize: '0.75rem', color: '#ffd700', marginBottom: 6, opacity: 0.9, fontWeight: 500 }}>
                                    {char.role}
                                </div>

                                {char.traits && char.traits.length > 0 && (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
                                        {char.traits.map(t => (
                                            <span key={t} style={{ fontSize: '0.6rem', padding: '2px 6px', background: 'rgba(255,255,255,0.1)', borderRadius: 10, opacity: 0.8 }}>
                                                {t}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {char.description && (
                                    <div style={{ fontSize: '0.7rem', opacity: 0.6, lineHeight: '1.2' }}>{char.description}</div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
