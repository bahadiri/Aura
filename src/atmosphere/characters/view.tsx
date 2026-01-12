import React from 'react';
import styles from '../../styles/aur.module.css';
import { Character } from './model';

interface ViewProps {
    title: string;
    characters: Character[];
    onSelect: (char: Character) => void;
}

export const View: React.FC<ViewProps> = ({
    title,
    characters,
    onSelect
}) => {
    return (
        <div className={styles.screenContent}>
            <div className={styles.aurSectionTitle}>{title}</div>

            <div className={styles.scrollArea}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 15 }}>
                    {characters.map(char => (
                        <div
                            key={char.id}
                            style={{
                                background: 'rgba(255,255,255,0.05)',
                                borderRadius: 8,
                                overflow: 'hidden',
                                cursor: 'pointer',
                                transition: 'transform 0.2s',
                                border: '1px solid rgba(255,255,255,0.05)'
                            }}
                            onClick={() => onSelect(char)}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            <div style={{ height: 120, background: '#000', overflow: 'hidden' }}>
                                {char.imageUrl ? (
                                    <img src={char.imageUrl} alt={char.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>👤</div>
                                )}
                            </div>
                            <div style={{ padding: 10 }}>
                                <div style={{ fontWeight: 'bold', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{char.name}</div>
                                <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>{char.role}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
