import { useState, useEffect } from 'react';

export interface YoutubePlayerAIRProps {
    videoId?: string;
    query?: string;
    autoplay?: boolean;
}

export const useYoutubePlayer = ({ videoId: initialVideoId, query, autoplay = false }: YoutubePlayerAIRProps) => {
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
            fetch(`http://localhost:8000/api/search/video?q=${encodeURIComponent(query)}`)
                .then(res => res.json())
                .then(data => {
                    if (data.videoId) {
                        setVideoId(data.videoId);
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
