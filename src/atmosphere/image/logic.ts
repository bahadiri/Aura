import { useState, useEffect } from 'react';
import { useAura } from '../../sdk';
import { resources } from './resources';
import { uploadImageFromUrl, isFirebaseStorageUrl } from '../../utils/storage';

export interface UseImageProps {
    src?: string;
    query?: string;
    alt?: string;
    title?: string;
    projectId?: string;
    windowId?: string;
    updateWindow?: (data: any) => void;
}

export const useImageLogic = (props: UseImageProps) => {
    const { proxy } = useAura();
    const [src, setSrc] = useState(props.src || '');
    const [loading, setLoading] = useState(!props.src && !!props.query);
    const [error, setError] = useState('');

    useEffect(() => {
        // If persisted URL exists, use it
        if (props.src) {
            setSrc(props.src);
            setLoading(false);
            return;
        }

        // Search if Query exists
        if (props.query) {
            performSearch(props.query);
        }
    }, [props.src, props.query]);

    const performSearch = async (q: string) => {
        setLoading(true);
        setError('');
        console.log(`[ImageAIR] Searching for "${q}"...`);

        try {
            // 1. Try TMDB Backend Search (Primary)
            console.log(`[ImageAIR] Attempting TMDB Search...`);
            let foundUrl: string | undefined;

            try {
                const tmdbData = await proxy.fetch(resources.api.tmdb.image.config, {
                    params: { q: q, mode: 'movie' }
                });

                if (tmdbData && tmdbData.url) {
                    console.log(`[ImageAIR] TMDB Found: ${tmdbData.url}`);
                    foundUrl = tmdbData.url;
                }
            } catch (tmdbErr) {
                console.warn(`[ImageAIR] TMDB Search failed, falling back...`, tmdbErr);
            }

            // 2. Fallback to Google Search (Secondary) if TMDB failed
            if (!foundUrl) {
                console.log(`[ImageAIR] Falling back to Google Search...`);
                const cx = import.meta.env.VITE_GOOGLE_SEARCH_CX;
                if (!cx) throw new Error("Missing Google Search CX");

                const googleData = await proxy.fetch(resources.api.google.image.config, {
                    params: {
                        cx: cx,
                        q: q,
                        searchType: 'image',
                        num: '1'
                    }
                });

                if (googleData.items && googleData.items.length > 0) {
                    foundUrl = googleData.items[0].link;
                    console.log(`[ImageAIR] Google Search Found: ${foundUrl}`);
                }
            }

            if (foundUrl) {
                // Persist to Firebase
                try {
                    const persistentUrl = await uploadImageFromUrl(
                        foundUrl,
                        props.projectId || 'default',
                        props.windowId || `img-${Date.now()}`
                    );
                    setSrc(persistentUrl);
                    if (props.updateWindow) {
                        props.updateWindow({ props: { ...props, src: persistentUrl } });
                    }
                } catch (persistErr) {
                    console.error("[ImageAIR] Persistence failed, using external URL", persistErr);
                    setSrc(foundUrl);
                    // Still update window with external URL if persistence fails
                    if (props.updateWindow) {
                        props.updateWindow({ props: { ...props, src: foundUrl } });
                    }
                }

            } else {
                setError("Image not found");
            }

        } catch (err: any) {
            console.error("[ImageAIR] Search failed", err);
            setError("Failed to load image");
        } finally {
            setLoading(false);
        }
    };

    return {
        src,
        loading,
        error,
        title: props.title || props.query
    };
};
