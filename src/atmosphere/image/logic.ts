import React, { useState, useEffect } from 'react';
import { useAura } from '../../sdk';
import { resources as defaultResources } from './resources';
import { getStorage } from '../../storage';

const MIME_TO_EXT: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp'
};

const getExtFromMime = (mime: string): string =>
    MIME_TO_EXT[mime.split(';')[0]] || 'jpg';


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
    // Access IAuraConfig resources
    const auraResources = (useAura() as any).config?.resources || {};

    // Helper to get effective resource
    const getResource = (key: string, defaultRes: any) => {
        return auraResources[key] || defaultRes;
    };

    const tmdbConfig = getResource('tmdb.image', defaultResources.api.tmdb.image.config);
    const googleConfig = getResource('google.image', defaultResources.api.google.image.config);

    const [src, setSrc] = useState(props.src || '');
    const [loading, setLoading] = useState(false); // Start false, let effect trigger search
    const [error, setError] = useState('');

    // Use ref to track the last searched query to prevent loops
    const lastSearchedQuery = React.useRef<string | null>(null);

    useEffect(() => {
        // If persisted URL exists, use it
        if (props.src) {
            console.log(`[ImageAIR] Using persisted source: ${props.src}`);
            setSrc(props.src);
            setLoading(false);
            return;
        }

        // Search if Query exists AND differs from last search
        if (props.query && props.query !== lastSearchedQuery.current) {
            performSearch(props.query);
        }
    }, [props.src, props.query]);

    const performSearch = async (q: string) => {
        // Prevent re-entry
        if (loading || q === lastSearchedQuery.current) return;

        lastSearchedQuery.current = q; // Mark as searched
        setLoading(true);
        setError('');
        console.log(`[ImageAIR] Searching for "${q}"...`);

        try {
            // 1. Try TMDB Backend Search (Primary)
            console.log(`[ImageAIR] Attempting TMDB Search...`);
            let foundUrl: string | undefined;

            try {
                const tmdbData = await proxy.fetch(tmdbConfig, {
                    params: { q: q, mode: 'movie' }
                });

                if (tmdbData && tmdbData.url) {
                    console.log(`[ImageAIR] TMDB Found: ${tmdbData.url}`);
                    foundUrl = tmdbData.url;
                } else if (tmdbData && tmdbData.error) {
                    console.warn(`[ImageAIR] TMDB Search API returned error:`, tmdbData.error);
                }
            } catch (tmdbErr) {
                console.warn(`[ImageAIR] TMDB Search failed, falling back...`, tmdbErr);
            }

            // 2. Fallback to Google Search (Secondary) if TMDB failed
            if (!foundUrl) {
                console.log(`[ImageAIR] Falling back to Google Search...`);
                // Check if Google key is configured
                if (!googleConfig) {
                    console.warn("[ImageAIR] Google Search config missing, skipping fallback.");
                } else {
                    try {
                        const cx = import.meta.env.VITE_GOOGLE_SEARCH_CX;
                        if (!cx) throw new Error("Missing Google Search CX");

                        const googleData = await proxy.fetch(googleConfig, {
                            params: {
                                cx: cx,
                                q: q,
                                searchType: 'image',
                                num: '1'
                            }
                        });

                        // Check for Google API errors explicitly
                        if (googleData.error) {
                            console.warn("[ImageAIR] Google Search API error:", googleData.error);
                        } else if (googleData.items && googleData.items.length > 0) {
                            foundUrl = googleData.items[0].link;
                        }
                    } catch (googleErr) {
                        console.warn("[ImageAIR] Google Search failed.", googleErr);
                    }
                }
            }

            if (foundUrl) {
                // Persist to Firebase Storage
                const storage = getStorage();

                // 1. Fetch Blob via Direct Fetch (CORS Check)
                let blob: Blob | undefined;
                try {
                    const imgRes = await fetch(foundUrl);
                    if (!imgRes.ok) throw new Error('Direct fetch failed');
                    blob = await imgRes.blob();
                } catch (directErr) {
                    console.warn("[ImageAIR] Direct fetch failed (CORS?), trying proxy...", directErr);
                    try {
                        // Fallback: Fetch via Proxy
                        // We use a generic proxy config just for the target URL
                        const proxyData = await proxy.fetch({
                            url: foundUrl,
                            method: 'GET',
                            auth_id: '' // No auth needed for public images
                        });

                        if (proxyData && proxyData.is_base64 && proxyData.data) {
                            const res = await fetch(proxyData.data);
                            blob = await res.blob();
                        }
                    } catch (proxyErr) {
                        console.warn("[ImageAIR] Proxy fetch also failed.", proxyErr);
                    }
                }

                if (blob) {
                    try {
                        const ext = getExtFromMime(blob.type);
                        const path = `projects/${props.projectId || 'default'}/images/${props.windowId || Date.now()}.${ext}`;

                        const persistentUrl = await storage.objects.putFromBlob(path, blob, blob.type);
                        const downloadUrl = await storage.objects.getUrl(persistentUrl);

                        setSrc(downloadUrl);
                        if (props.updateWindow) {
                            props.updateWindow({ props: { ...props, src: downloadUrl } });
                        }
                        return; // Success
                    } catch (persistErr) {
                        console.error("[ImageAIR] Storage put failed", persistErr);
                    }
                }

                // Fallback if blob fetch failed or storage put failed
                setSrc(foundUrl);
                if (props.updateWindow) {
                    props.updateWindow({ props: { ...props, src: foundUrl } });
                }

            } else {
                console.error(`[ImageAIR] All Search Attempts Failed for "${q}"`);
                setError("Image not found");
                // Do NOT reset lastSearchedQuery, so we don't loop.
            }

        } catch (err: any) {
            console.error("[ImageAIR] Critical Search Error", err);
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
