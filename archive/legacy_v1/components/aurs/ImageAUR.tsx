import React from 'react';
import styles from './AURs.module.css';

export interface ImageAURProps {
    src: string;
    alt?: string;
    title?: string;
}

export const ImageAUR: React.FC<ImageAURProps> = ({ src, alt, title }) => {
    return (
        <div className={styles.screenContent} style={{ padding: 0 }}>
            <div className={styles.imageWrapper}>
                <img
                    src={src || 'https://via.placeholder.com/300x450?text=No+Image'}
                    alt={alt || title || 'AUR Image'}
                    className={styles.image}
                />
            </div>
            {title && (
                <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: '20px 16px 10px',
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                    color: 'white',
                    fontWeight: 600
                }}>
                    {title}
                </div>
            )}
        </div>
    );
};
