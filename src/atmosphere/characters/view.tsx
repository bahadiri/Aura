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
                <div style={{ position: 'absolute', top: 60, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.05)', zIndex: 10 }}>
                    <div className={styles.hourglass}></div>
                    <p style={{ marginTop: 12, opacity: 0.6, fontSize: '0.8rem' }}>Gathering character profiles...</p>
                </div>
            )}

            {error && (
                <div style={{ padding: 20, textAlign: 'center', opacity: 0.6 }}>
                    <p>⚠️ {error}</p>
                </div>
            )}

            <div className={styles.scrollArea}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 15, padding: '0 5px' }}>
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
                            <div style={{ height: 120, background: '#000', overflow: 'hidden' }}>
                                {char.imageUrl ? (
                                    <img src={char.imageUrl} alt={char.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>👤</div>
                                )}
                            </div>
                            <div style={{ padding: '12px 10px' }}>
                                <div style={{ fontWeight: 'bold', fontSize: '0.9rem', marginBottom: 2 }}>{char.name}</div>
                                <div style={{ fontSize: '0.7rem', color: '#ffcc00', marginBottom: 6, opacity: 0.8, fontWeight: 600 }}>{char.role}</div>

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
