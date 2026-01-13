import { useState, useEffect } from 'react';

export interface ImageAIRProps {
    src?: string;
    query?: string;
    alt?: string;
    title?: string;
    language?: string;
    prompt?: string;
}

export const useImageAIR = (props: ImageAIRProps) => {
    const [src, setSrc] = useState(props.src || '');
    const [loading, setLoading] = useState(!props.src && !!props.query);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!props.src && props.query) {
            setLoading(true);
            // Search for image
            fetch(`http://localhost:8000/api/search/image?q=${encodeURIComponent(props.query)}`)
                .then(res => {
                    console.log("Image Search Response Status:", res.status);
                    return res.json();
                })
                .then(data => {
                    console.log("Image Search Data:", data);
                    if (data.poster_path) {
                        setSrc(`https://image.tmdb.org/t/p/w500${data.poster_path}`);
                    } else if (data.url) {
                        setSrc(data.url);
                    } else {
                        console.warn("No poster_path or url in data");
                        setError('Image not found');
                        setSrc('https://via.placeholder.com/400x600?text=No+Image+Found');
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
