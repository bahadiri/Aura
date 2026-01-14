import { useState, useEffect } from 'react';

export interface YoutubePlayerAIRProps {
    videoId?: string;
    query?: string;
    autoplay?: boolean;
    updateWindow?: (data: any) => void;
}

export const useYoutubePlayer = ({ videoId: initialVideoId, query, autoplay = false, updateWindow }: YoutubePlayerAIRProps) => {
    const [videoId, setVideoId] = useState(initialVideoId);
    const [isLoading, setIsLoading] = useState(!initialVideoId && !!query);
    const [error, setError] = useState('');

    useEffect(() => {
        if (initialVideoId) {
            setVideoId(initialVideoId);
            setIsLoading(false);
            setError('');
            return;
        }

        if (query) {
            setIsLoading(true);
            setError('');
            const port = import.meta.env.VITE_SAGA_BACKEND_PORT || '8001';
            const baseUrl = import.meta.env.VITE_SAGA_API_URL || `http://localhost:${port}`;
            fetch(`${baseUrl}/api/search/video?q=${encodeURIComponent(query)}`)
                .then(res => res.json())
                .then(data => {
                    if (data.videoId) {
                        setVideoId(data.videoId);
                        if (updateWindow) {
                            updateWindow({ props: { videoId: data.videoId, query } });
                        }
                    } else {
                        setError(data.error || 'Trailer not found');
                    }
                })
                .catch(err => {
                    console.error("Video fetch failed:", err);
                    setError('Failed to load video');
                })
                .finally(() => setIsLoading(false));
        }
    }, [initialVideoId, query]);

    const url = videoId
        ? `https://www.youtube.com/embed/${videoId}${autoplay ? '?autoplay=1' : ''}`
        : null;

    return {
        videoId,
        url,
        isLoading,
        error
    };
};
