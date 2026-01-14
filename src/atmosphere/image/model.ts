import { useState, useEffect } from 'react';
import { uploadImageFromUrl, isFirebaseStorageUrl } from '../../utils/storage';

export interface ImageAIRProps {
    src?: string;
    query?: string;
    alt?: string;
    title?: string;
    language?: string;
    prompt?: string;
    projectId?: string;
    windowId?: string;
    updateWindow?: (data: any) => void;
}

export const useImageAIR = (props: ImageAIRProps) => {
    const [src, setSrc] = useState(props.src || '');
    const [loading, setLoading] = useState(!props.src && !!props.query);
    const [error, setError] = useState('');

    useEffect(() => {
        console.log(`[ImageAIR] Mount/Update - props.src: "${props.src}", props.query: "${props.query}"`);

        // If we already have a src from Firebase Storage, use it directly (no re-fetch)
        if (props.src && isFirebaseStorageUrl(props.src)) {
            console.log(`[ImageAIR] Using persisted Firebase URL: ${props.src}`);
            setSrc(props.src);
            setLoading(false);
            return;
        }

        // If we have a non-Firebase src (legacy or external), use it but don't re-fetch
        if (props.src) {
            console.log(`[ImageAIR] Using existing src: ${props.src}`);
            setSrc(props.src);
            setLoading(false);
            return;
        }

        // Only search if we have a query but no src
        if (props.query) {
            setLoading(true);
            const apiKey = import.meta.env.VITE_GOOGLE_SEARCH_API_KEY;
            const cx = import.meta.env.VITE_GOOGLE_SEARCH_CX;

            const searchGoogle = async (query: string): Promise<any> => {
                if (!apiKey || apiKey.startsWith("YOUR_")) throw new Error("VITE_GOOGLE_SEARCH_API_KEY missing");
                if (!cx || cx.startsWith("YOUR_")) throw new Error("VITE_GOOGLE_SEARCH_CX missing");

                const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(query)}&searchType=image&num=1`;
                const res = await fetch(url);
                if (!res.ok) {
                    const err = await res.json();
                    throw new Error(err.error?.message || "Google Search request failed");
                }
                return res.json();
            };

            const runSearch = async () => {
                try {
                    console.log(`[ImageAIR] Searching Google for: "${props.query}"`);
                    let data = await searchGoogle(props.query!);
                    let items = data.items || [];

                    if (items.length > 0) {
                        const externalUrl = items[0].link;

                        // Upload to Firebase Storage for persistence (using Aura's utility)
                        const persistentUrl = await uploadImageFromUrl(
                            externalUrl,
                            props.projectId || 'default',
                            props.windowId || `img-${Date.now()}`
                        );

                        console.log(`[ImageAIR] Persisted to: ${persistentUrl}`);
                        setSrc(persistentUrl);

                        if (props.updateWindow) {
                            props.updateWindow({ props: { ...props, src: persistentUrl } });
                        }
                    } else {
                        setError('Image not found');
                        setSrc('https://via.placeholder.com/400x600?text=Not+Found');
                    }
                } catch (err: any) {
                    console.error("Image search failed:", err);
                    if (err.message.includes("VITE_GOOGLE_SEARCH_CX")) {
                        setError("Missing Search Engine ID (CX)");
                    } else {
                        setError('Failed to load image');
                    }
                } finally {
                    setLoading(false);
                }
            };

            runSearch();
        }
    }, [props.src, props.query]);

    return {
        ...props,
        src,
        loadingProp: loading,
        displayTitle: props.title || props.query
    };
};
