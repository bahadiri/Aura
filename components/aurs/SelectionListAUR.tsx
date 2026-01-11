import React from 'react';
import styles from './AURs.module.css';

export interface SelectionListAURProps<T> {
    items: T[];
    selectedIds: string[] | number[];
    onToggle: (id: string | number) => void;
    renderItem: (item: T, isSelected: boolean) => React.ReactNode;
    keyExtractor: (item: T) => string | number;
    title?: string;
    emptyText?: string;
}

export const SelectionListAUR = <T,>({
    items,
    selectedIds,
    onToggle,
    renderItem,
    keyExtractor,
    title,
    emptyText = "No items found."
}: SelectionListAURProps<T>) => {
    return (
        <div className={styles.screenContent}>
            {title && <div style={{ marginBottom: 12, fontWeight: 700, opacity: 0.6, fontSize: '0.8rem', textTransform: 'uppercase' }}>{title}</div>}

            <div className={styles.scrollArea}>
                {items.length === 0 ? (
                    <div style={{ textAlign: 'center', opacity: 0.4, padding: 40 }}>{emptyText}</div>
                ) : (
                    <div className={styles.listContainer}>
                        {items.map(item => {
                            const id = keyExtractor(item);
                            const isSelected = selectedIds.includes(id as any);
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
