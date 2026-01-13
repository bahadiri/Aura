import React from 'react';
import styles from '../../styles/aur.module.css';

interface ViewProps {
    videoId?: string;
    url: string | null;
    isLoading?: boolean;
    error?: string;
}

export const View: React.FC<ViewProps> = ({ videoId, url, isLoading, error }) => {
    if (isLoading) {
        return (
            <div className={styles.screenContent} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#000' }}>
                <div className={styles.hourglass}></div>
                <p style={{ marginTop: 12, opacity: 0.6, fontSize: '0.8rem', color: '#fff' }}>Searching for trailer...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.screenContent} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, textAlign: 'center', background: '#000', color: '#fff' }}>
                <p>⚠️ {error}</p>
            </div>
        );
    }

    if (!videoId || !url) {
        return <div className={styles.screenContent} style={{ padding: 20, background: '#000', color: '#fff' }}>No Video found.</div>;
    }

    return (
        <div className={styles.screenContent} style={{ padding: 0, background: '#000' }}>
            <iframe
                width="100%"
                height="100%"
                src={url}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
            ></iframe>
        </div>
    );
};
