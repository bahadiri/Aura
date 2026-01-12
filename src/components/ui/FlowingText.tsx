import React from 'react';
import styles from './FlowingText.module.css';

interface FlowingTextProps {
    transcript: string;
    interimTranscript: string;
    isListening: boolean;
    onCorrection?: (text: string) => void;
}

export const FlowingText: React.FC<FlowingTextProps> = ({
    transcript,
    interimTranscript,
    isListening
}) => {
    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <span className={styles.final}>{transcript}</span>
                <span className={styles.interim}>{interimTranscript}</span>
                {isListening && <span className={styles.cursor}>|</span>}
            </div>
        </div>
    );
};
