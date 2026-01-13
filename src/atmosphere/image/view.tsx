import React from 'react';
import styles from '../../styles/aur.module.css';

export interface ImageAIRProps {
    src?: string;
    loadingProp?: boolean;
    alt?: string;
    title?: string;
}

export const View: React.FC<ImageAIRProps> = ({ src, alt, title, loadingProp }) => {
    const [imageLoading, setImageLoading] = React.useState(true);

    // Combine fetch loading with image load event
    const isLoading = loadingProp || (src && imageLoading);

    return (
        <div className={styles.screenContent} style={{ padding: 0 }}>
            {isLoading && (
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
                    background: 'white',
                    zIndex: 2
                }}>
                    <div className={styles.hourglass}></div>
                    <p style={{ marginTop: 12, opacity: 0.6, fontSize: '0.8rem' }}>Loading Image...</p>
                </div>
            )}

            <div className={styles.imageWrapper}>
                <img
                    src={src || 'https://via.placeholder.com/300x450?text=No+Image'}
                    alt={alt || title || 'AIR Image'}
                    className={styles.image}
                    onLoad={() => setImageLoading(false)}
                    style={{ opacity: isLoading ? 0 : 1, transition: 'opacity 0.3s' }}
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
                    zIndex: 3
                }}>
                    {title}
                </div>
            )}
        </div>
    );
};
