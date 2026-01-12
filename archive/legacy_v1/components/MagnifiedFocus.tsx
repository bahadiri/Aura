import React from 'react';
import styles from './MagnifiedFocus.module.css';

interface MagnifiedFocusProps {
    activeSentence: string;
    suggestions?: string[];
    onAcceptSuggestion?: (suggestion: string) => void;
}

export const MagnifiedFocus: React.FC<MagnifiedFocusProps> = ({
    activeSentence,
    suggestions = [],
    onAcceptSuggestion
}) => {
    if (!activeSentence) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.focusBox}>
                <h3 className={styles.label}>Polishing...</h3>
                <p className={styles.sentence}>{activeSentence}</p>

                {suggestions.length > 0 && (
                    <div className={styles.suggestions}>
                        {suggestions.map((s, i) => (
                            <button
                                key={i}
                                className={styles.suggestionChip}
                                onClick={() => onAcceptSuggestion?.(s)}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
