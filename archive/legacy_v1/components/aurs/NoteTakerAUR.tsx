import React from 'react';
import styles from './AURs.module.css';

export interface NoteTakerAURProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export const NoteTakerAUR: React.FC<NoteTakerAURProps> = ({ value, onChange, placeholder = "Take notes here..." }) => {
    return (
        <div className={styles.screenContent} style={{ padding: 0 }}>
            <textarea
                className={styles.noteArea}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
            />
        </div>
    );
};
