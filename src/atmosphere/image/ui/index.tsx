import React, { useState } from 'react';
import styles from '../../../styles/aur.module.css';

export interface ImageUIProps {
    src?: string;
    loading?: boolean;
    alt?: string;
    title?: string;
    error?: string;
}

const ImageUI: React.FC<ImageUIProps> = ({ src, alt, title, loading, error }) => {
    const [imageLoading, setImageLoading] = useState(true);

    // Combine fetch loading with image load event
    const isLoading = loading || (src && imageLoading);

    return (
        <div className={styles.screenContent} style={{ padding: 0, height: '100%', position: 'relative', overflow: 'hidden' }}>
            {isLoading && !error && (
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'var(--bg-secondary)', // Use theme var
                    zIndex: 2,
                    color: 'var(--text-primary)'
                }}>
                    <div className={styles.hourglass}></div>
                    <p style={{ marginTop: 12, opacity: 0.6, fontSize: '0.8rem' }}>Loading Image...</p>
                </div>
            )}

            {error && (
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    padding: 20,
                    textAlign: 'center',
                    zIndex: 3
                }}>
                    ⚠️ {error}
                </div>
            )}

            <div className={styles.imageWrapper} style={{ height: '100%', width: '100%' }}>
                <img
                    src={src || 'https://placehold.co/400x600?text=Waiting+for+Image'}
                    alt={alt || title || 'AIR Image'}
                    className={styles.image}
                    onLoad={() => setImageLoading(false)}
                    onError={() => setImageLoading(false)}
                    style={{
                        opacity: isLoading ? 0 : 1,
                        transition: 'opacity 0.3s',
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                    }}
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
                    fontWeight: 600,
                    zIndex: 3,
                    pointerEvents: 'none'
                }}>
                    {title}
                </div>
            )}
        </div>
    );
};

export default ImageUI;
