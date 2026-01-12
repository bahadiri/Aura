import React from 'react';
import styles from '../../styles/aur.module.css';
import { InfoItem } from './model';

interface ViewProps {
    items: InfoItem[];
    title?: string;
    columns: number;
    collapsible: boolean;
    headerContent?: React.ReactNode;
    isLoading?: boolean;
    loadingText: string;
    expandedId: string | number | null;
    onToggle: (id: string | number) => void;
}

export const View: React.FC<ViewProps> = ({
    items,
    title,
    columns,
    collapsible,
    headerContent,
    isLoading,
    loadingText,
    expandedId,
    onToggle
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

            {headerContent && <div className={styles.headerArea}>{headerContent}</div>}

            <div className={styles.scrollArea}>
                <div className={styles.gridContainer} style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${columns}, 1fr)`,
                    gap: '12px'
                }}>
                    {items.map((item, i) => {
                        const id = item.id || i;
                        const isExpanded = expandedId === id;

                        return (
                            <div
                                key={id}
                                className={`${styles.infoCard} ${isExpanded ? styles.expanded : ''} ${collapsible ? styles.clickable : ''}`}
                                onClick={() => onToggle(id)}
                            >
                                <div className={styles.cardHeader}>
                                    <h3 className={styles.cardTitle}>{item.title}</h3>
                                    {collapsible && <span className={styles.chevron}>{isExpanded ? '▴' : '▾'}</span>}
                                </div>

                                {(isExpanded || !collapsible) && (
                                    <div className={styles.cardBody}>
                                        <p className={styles.cardDescription}>{item.description}</p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {items.length === 0 && (
                    <div style={{ textAlign: 'center', opacity: 0.4, padding: 40 }}>
                        No information available yet.
                    </div>
                )}
            </div>
        </div>
    );
};
