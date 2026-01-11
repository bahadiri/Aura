import React from 'react';
import styles from './AURs.module.css';

export interface YoutubePlayerAURProps {
    videoId: string;
    autoplay?: boolean;
}

export const YoutubePlayerAUR: React.FC<YoutubePlayerAURProps> = ({ videoId, autoplay = false }) => {
    if (!videoId) return <div className={styles.screenContent}>No Video ID provided.</div>;

    const url = `https://www.youtube.com/embed/${videoId}${autoplay ? '?autoplay=1' : ''}`;

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
