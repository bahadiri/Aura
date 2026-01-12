
import React from 'react';
import styles from './AURs.module.css';

export interface QueryAURProps {
    query: string;
    onQueryChange: (q: string) => void;
    results: any[];
    onSelect: (item: any) => void;
    isSearching?: boolean;
    placeholder?: string;
    renderResult?: (item: any) => React.ReactNode;
    emptyText?: string;
    selectedItemName?: string;
    onChangeItem?: () => void;
}

export const QueryAUR: React.FC<QueryAURProps> = ({
    query,
    onQueryChange,
    results,
    onSelect,
    isSearching,
    placeholder = "Search...",
    renderResult,
    emptyText = "Search to find items",
    selectedItemName,
    onChangeItem
}) => {
    if (selectedItemName) {
        return (
            <div className={styles.screenContent} style={{ justifyContent: 'center', alignItems: 'center' }}>
                <p className={styles.emptyText}>{selectedItemName}</p>
                {onChangeItem && (
                    <button className={styles.actionButton} onClick={onChangeItem}>
                        Change
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className={styles.screenContent}>
            <div className={styles.searchContainer}>
                <div className={styles.searchWrapper}>
                    <input
                        type="text"
                        className={styles.searchInput}
                        placeholder={placeholder}
                        value={query}
                        onChange={(e) => onQueryChange(e.target.value)}
                        autoFocus
                    />
                    {isSearching && <div className={styles.searchLoader}>Searching...</div>}
                </div>

                <div className={styles.scrollArea}>
                    {results.length > 0 ? (
                        <div className={styles.autocompleteList}>
                            {results.map((item, i) => (
                                <div
                                    key={i}
                                    className={styles.searchResultItem}
                                    onClick={() => onSelect(item)}
                                >
                                    {renderResult ? renderResult(item) : (
                                        <span className={styles.itemName}>{item.name || item.title || String(item)}</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', opacity: 0.4, padding: 40 }}>
                            {query ? "No results found." : emptyText}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
