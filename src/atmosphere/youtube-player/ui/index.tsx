import React from 'react';
import styles from '../../../styles/aur.module.css';

export interface YoutubeUIProps {
    videoId?: string;
    url: string | null;
    isLoading?: boolean;
    error?: string;
}

const YoutubeUI: React.FC<YoutubeUIProps> = ({ videoId, url, isLoading, error }) => {
    if (isLoading) {
        return (
            <div className={styles.screenContent} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#000', height: '100%' }}>
                <div className={styles.hourglass}></div>
                <p style={{ marginTop: 12, opacity: 0.6, fontSize: '0.8rem', color: '#fff' }}>Searching YouTube...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.screenContent} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, textAlign: 'center', background: '#000', color: '#fff', height: '100%' }}>
                <p>⚠️ {error}</p>
            </div>
        );
    }

    if (!videoId || !url) {
        return <div className={styles.screenContent} style={{ padding: 20, background: '#000', color: '#fff', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No Video loaded. Ask to play something.</div>;
    }

    return (
        <div className={styles.screenContent} style={{ padding: 0, background: '#000', height: '100%', overflow: 'hidden' }}>
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

export default YoutubeUI;
