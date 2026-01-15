import { useState, useEffect } from 'react';

export interface YoutubePlayerAIRProps {
    videoId?: string;
    query?: string;
    autoplay?: boolean;
    updateWindow?: (data: any) => void;
}

/**
 * Search for YouTube videos using either:
 * 1. YouTube Data API v3 (client-side, requires VITE_YOUTUBE_API_KEY)
 * 2. Saga backend fallback (if no API key is set)
 */
async function searchYouTube(query: string): Promise<{ videoId: string; title: string } | { error: string }> {
    const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;

    // OPTION A: Client-side YouTube Data API (if key is available)
    if (apiKey && !apiKey.startsWith('YOUR_')) {
        try {
            console.log('[YouTube AIR] Using YouTube Data API (client-side)');
            const url = new URL('https://www.googleapis.com/youtube/v3/search');
            url.searchParams.set('part', 'snippet');
            url.searchParams.set('maxResults', '1');
            url.searchParams.set('q', query);
            url.searchParams.set('type', 'video');
            url.searchParams.set('key', apiKey);

            const response = await fetch(url.toString());

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('[YouTube AIR] API Error:', response.status, errorData);

                if (response.status === 403 || response.status === 400) {
                    return { error: 'YouTube API quota exceeded or invalid key. Please check credentials.' };
                }
                throw new Error(`API returned ${response.status}`);
            }

            const data = await response.json();

            if (data.items && data.items.length > 0) {
                const item = data.items[0];
                const videoId = item.id.videoId;
                const title = item.snippet.title;
                console.log('[YouTube AIR] Found:', title, `(${videoId})`);
                return { videoId, title };
            }

            return { error: 'No videos found' };
        } catch (err) {
            console.error('[YouTube AIR] API failed, falling back to backend:', err);
            // Fall through to backend fallback
        }
    }

    // OPTION B: Saga backend fallback
    try {
        console.log('[YouTube AIR] Using Saga backend fallback');
        const port = import.meta.env.VITE_SAGA_BACKEND_PORT || '8001';
        const baseUrl = import.meta.env.VITE_SAGA_API_URL || `http://localhost:${port}`;

        const response = await fetch(`${baseUrl}/api/search/video?q=${encodeURIComponent(query)}`);
        const data = await response.json();

        if (data.videoId) {
            return { videoId: data.videoId, title: data.name || query };
        }

        return { error: data.error || 'Video not found' };
    } catch (err) {
        console.error('[YouTube AIR] Backend search failed:', err);
        return { error: 'Search failed. Please try a direct YouTube URL.' };
    }
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
            // Check if query is a direct YouTube URL
            const urlMatch = query.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);

            if (urlMatch && urlMatch[1]) {
                const extractedId = urlMatch[1];
                console.log('[YouTube AIR] Extracted video ID from URL:', extractedId);
                setVideoId(extractedId);
                setIsLoading(false);
                setError('');
                if (updateWindow) {
                    updateWindow({ props: { videoId: extractedId, query } });
                }
                return;
            }

            // Otherwise, perform search
            setIsLoading(true);
            setError('');

            searchYouTube(query)
                .then(result => {
                    if ('videoId' in result) {
                        setVideoId(result.videoId);
                        if (updateWindow) {
                            updateWindow({ props: { videoId: result.videoId, query } });
                        }
                    } else {
                        setError(result.error);
                    }
                })
                .catch(err => {
                    console.error('[YouTube AIR] Search error:', err);
                    setError('Failed to search. Please try a direct YouTube URL.');
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
