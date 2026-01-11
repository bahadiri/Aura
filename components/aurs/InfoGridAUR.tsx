
import React, { useState } from 'react';
import styles from './AURs.module.css';

export interface InfoItem {
    id?: string | number;
    title: string;
    description: string;
    metadata?: any;
}

export interface InfoGridAURProps {
    items: InfoItem[];
    title?: string;
    columns?: number;
    collapsible?: boolean;
    headerContent?: React.ReactNode;
    isLoading?: boolean;
    loadingText?: string;
}

export const InfoGridAUR: React.FC<InfoGridAURProps> = ({
    items,
    title,
    columns = 1,
    collapsible = false,
    headerContent,
    isLoading,
    loadingText = "Loading..."
}) => {
    const [expandedId, setExpandedId] = useState<string | number | null>(null);

    const toggle = (id: string | number) => {
        if (!collapsible) return;
        setExpandedId(expandedId === id ? null : id);
    };

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
                                onClick={() => toggle(id)}
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
