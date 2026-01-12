import React from 'react';
import styles from '../../styles/aur.module.css';

interface ViewProps {
    value: string;
    setValue: (val: string) => void;
    placeholder: string;
}

export const View: React.FC<ViewProps> = ({
    value,
    setValue,
    placeholder
}) => {
    return (
        <div className={styles.screenContent} style={{ padding: 0 }}>
            <textarea
                className={styles.noteArea}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={placeholder}
            />
        </div>
    );
};
