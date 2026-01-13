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
            const port = import.meta.env.VITE_SAGA_BACKEND_PORT || '8001';
            // Search for image
            fetch(`http://localhost:${port}/api/search/image?q=${encodeURIComponent(props.query)}`)
                .then(res => {
                    console.log("Image Search Response Status:", res.status);
                    return res.json();
                })
                .then(data => {
                    console.log("Image Search Data:", data);
                    let foundSrc = '';
                    if (data.poster_path) {
                        foundSrc = `https://image.tmdb.org/t/p/w500${data.poster_path}`;
                    } else if (data.url) {
                        foundSrc = data.url;
                    } else {
                        console.warn("No poster_path or url in data");
                        setError('Image not found');
                        foundSrc = 'https://via.placeholder.com/400x600?text=No+Image+Found';
                    }
                    setSrc(foundSrc);
                    // Persist the found source!
                    if (props.updateWindow) {
                        props.updateWindow({ props: { ...props, src: foundSrc } });
                    }
                })
                .catch(err => {
                    console.error("Image search failed:", err);
                    setError('Failed to load image');
                })
                .finally(() => setLoading(false));
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
