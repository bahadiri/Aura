import React from 'react';
import styles from '../../styles/aur.module.css';

interface ViewProps {
    query: string;
    setQuery: (val: string) => void;
    isSearching: boolean;
    results: any[];
    placeholder: string;
    onSelect?: (item: any) => void;
}

export const View: React.FC<ViewProps> = ({
    query,
    setQuery,
    isSearching,
    results,
    placeholder,
    onSelect
}) => {
    return (
        <div className={styles.screenContent}>
            <div className={styles.searchContainer}>
                <div className={styles.searchWrapper}>
                    <input
                        type="text"
                        className={styles.searchInput}
                        placeholder={placeholder}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
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
                                    onClick={() => onSelect && onSelect(item)}
                                >
                                    <span className={styles.itemName}>{String(item)}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', opacity: 0.4, padding: 40 }}>
                            {query ? "No results found." : "Search to find items"}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
