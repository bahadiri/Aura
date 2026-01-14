import { useState, useEffect } from 'react';

export interface ImageAIRProps {
    src?: string;
    query?: string;
    alt?: string;
    title?: string;
    language?: string;
    prompt?: string;
    updateWindow?: (data: any) => void;
}

export const useImageAIR = (props: ImageAIRProps) => {
    const [src, setSrc] = useState(props.src || '');
    const [loading, setLoading] = useState(!props.src && !!props.query);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!props.src && props.query) {
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
                    console.log(`[ImageAIR] Searching Google for: "${props.query}" with key: ${apiKey?.substring(0, 5)}...`);
                    let data = await searchGoogle(props.query!);
                    console.log("[ImageAIR] Google Response:", data);
                    let items = data.items || [];

                    if (items.length > 0) {
                        const foundSrc = items[0].link;
                        setSrc(foundSrc);
                        if (props.updateWindow) {
                            props.updateWindow({ props: { ...props, src: foundSrc } });
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

        } else if (props.src) {
            setSrc(props.src);
            setLoading(false);
        }
    }, [props.src, props.query]);

    return {
        ...props,
        src,
        loadingProp: loading,
        displayTitle: props.title || props.query
    };
};
