import React, { ReactNode } from 'react';
import styles from '../../styles/aur.module.css';

interface ViewProps<T> {
    items: T[];
    selectedIds: string[] | number[];
    onToggle: (id: string | number) => void;
    renderItem?: (item: T, isSelected: boolean) => ReactNode;
    keyExtractor: (item: T) => string | number;
    title?: string;
    emptyText: string;
}

export const View = <T,>({
    items,
    selectedIds,
    onToggle,
    renderItem = (item) => <div>{String(item)}</div>,
    keyExtractor,
    title,
    emptyText
}: ViewProps<T>) => {
    return (
        <div className={styles.screenContent}>
            {title && <div className={styles.aurSectionTitle}>{title}</div>}

            <div className={styles.scrollArea}>
                {items.length === 0 ? (
                    <div style={{ textAlign: 'center', opacity: 0.4, padding: 40 }}>{emptyText}</div>
                ) : (
                    <div className={styles.listContainer}>
                        {items.map(item => {
                            const id = keyExtractor(item);
                            const isSelected = (selectedIds as any[]).includes(id);
                            return (
                                <div
                                    key={id}
                                    className={`${styles.listItem} ${isSelected ? styles.selected : ''}`}
                                    onClick={() => onToggle(id)}
                                >
                                    {renderItem(item, isSelected)}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};
