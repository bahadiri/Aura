import { useState, useEffect } from 'react';
import { useAura } from '../../sdk';
import { resources } from './resources';

export interface UseYoutubeProps {
    videoId?: string;
    query?: string;
    autoplay?: boolean;
    updateWindow?: (data: any) => void;
}

export const useYoutubeLogic = ({ videoId: initialVideoId, query, autoplay = false, updateWindow }: UseYoutubeProps) => {
    const { proxy } = useAura();
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
            // 1. Direct URL ID Extraction
            const urlMatch = query.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
            if (urlMatch && urlMatch[1]) {
                updateVideo(urlMatch[1], query);
                return;
            }

            // 2. Search
            performSearch(query);
        }
    }, [initialVideoId, query]);

    const updateVideo = (id: string, originQuery?: string) => {
        console.log(`[YouTubeAIR] Updating video: ${id}`);
        setVideoId(id);
        setIsLoading(false);
        setError('');
        if (updateWindow) {
            updateWindow({ props: { videoId: id, query: originQuery } });
        }
    };

    const performSearch = async (q: string) => {
        setIsLoading(true);
        setError('');

        try {
            // A. Try Official API (Client-side Direct or Proxy)
            const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
            let data;

            if (apiKey) {
                console.log(`[YouTubeAIR] Searching Client-Side API for "${q}"...`);
                const resource = resources.api.youtube.search;
                const params = new URLSearchParams({
                    part: 'snippet',
                    maxResults: '1',
                    q: q,
                    type: 'video',
                    key: apiKey
                });
                // Using URL from resources definition
                const res = await fetch(`${resource.config.url}?${params.toString()}`);
                data = await res.json();

                if (!res.ok) {
                    console.warn("[YouTubeAIR] Client API search failed", data);
                    throw new Error(data.error?.message || "Client API Error");
                }

            } else {
                console.warn("[YouTubeAIR] VITE_YOUTUBE_API_KEY is missing or empty! Env:", import.meta.env);
                console.log(`[YouTubeAIR] Searching Proxy for "${q}"...`);
                data = await proxy.fetch(resources.api.youtube.search, {
                    params: {
                        part: 'snippet',
                        maxResults: '1',
                        q: q,
                        type: 'video'
                    }
                });
            }

            if (data.items && data.items.length > 0) {
                const item = data.items[0];
                updateVideo(item.id.videoId, q);
                return;
            } else if (data.items) {
                // Empty items = not found (but successful call)
                throw new Error("No videos found via API");
            }

            // If data doesn't look like Yt response, throw to trigger fallback
            // But wait, if 403/429 occurs, proxy helper in proxy.ts throws Error.
            // So we catch below.

        } catch (err) {
            console.warn("[YouTubeAIR] Proxy search failed, trying backend scraper fallback...", err);

            // B. Fallback to Backend Scraper
            try {
                // We use standard fetch here to hit the backend endpoint directly
                // Assuming Vite proxy or absolute URL setup
                const port = import.meta.env.VITE_SAGA_BACKEND_PORT || '8001';
                const baseUrl = import.meta.env.VITE_SAGA_API_URL || `http://localhost:${port}`;
                const res = await fetch(`${baseUrl}/api/search/video?q=${encodeURIComponent(q)}`);
                const fallbackData = await res.json();

                if (fallbackData.videoId) {
                    updateVideo(fallbackData.videoId, q);
                } else {
                    setError(fallbackData.error || "Video not found.");
                }
            } catch (fbErr) {
                console.error("[YouTubeAIR] Fallback search failed", fbErr);
                setError("Search failed.");
            }
        } finally {
            setIsLoading(false);
        }
    };

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
