import React from 'react';
import styles from '../../styles/aur.module.css';

interface ViewProps {
    videoId?: string;
    url: string | null;
}

export const View: React.FC<ViewProps> = ({ videoId, url }) => {
    if (!videoId || !url) {
        return <div className={styles.screenContent} style={{ padding: 20 }}>No Video ID provided.</div>;
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
