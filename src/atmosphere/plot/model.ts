import { useState, useEffect } from 'react';

export interface Episode {
    id: string | number;
    season: number;
    episode: number;
    title: string;
    summary?: string;
}

export interface UsePlotAIRProps {
    mode?: 'series' | 'movie';
    seriesTitle?: string;
    moviePlot?: string;
    initialEpisodes?: Episode[];
    onFetchSummary?: (episodeId: string | number) => Promise<string>;
    language?: string;
    prompt?: string;
}

export const usePlotAIR = ({
    mode = 'series',
    moviePlot,
    query,
    initialEpisodes = [],
    onFetchSummary,
    language,
    prompt
}: UsePlotAIRProps & { query?: string }) => {
    const [episodes, setEpisodes] = useState<Episode[]>(initialEpisodes);
    const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});
    const [fetchedPlot, setFetchedPlot] = useState<string | undefined>(moviePlot);
    const [isSearching, setIsSearching] = useState(false);

    const displayPrompt = prompt;

    // Search for movie plot if needed
    useEffect(() => {
        if (mode === 'movie' && !moviePlot && query) {
            setIsSearching(true);
            fetch(`http://localhost:8000/api/search/image?q=${encodeURIComponent(query)}`)
                .then(res => res.json())
                .then(data => {
                    if (data.overview) {
                        setFetchedPlot(data.overview);
                    } else if (data.url) {
                        // Fallback if we only got image? 
                        setFetchedPlot("Found movie: " + data.title + ". (Plot unavailable in current API response)");
                    } else {
                        setFetchedPlot("Could not find plot for: " + query);
                    }
                })
                .catch(err => {
                    console.error("Plot search failed:", err);
                    setFetchedPlot("Failed to load plot.");
                })
                .finally(() => setIsSearching(false));
        } else if (moviePlot) {
            setFetchedPlot(moviePlot);
        }
    }, [mode, moviePlot, query]);

    const expandSummary = async (ep: Episode) => {
        if (ep.summary) return; // Already loaded

        setLoadingMap(prev => ({ ...prev, [ep.id]: true }));

        try {
            if (!onFetchSummary) {
                // Mock lazy load if no handler provided
                await new Promise(resolve => setTimeout(resolve, 1000));
                const mockSummary = language === 'tr'
                    ? `${ep.title} için yüklenen özet...`
                    : `Lazily loaded summary for ${ep.title}...`;

                setEpisodes(prev => prev.map(e =>
                    e.id === ep.id ? { ...e, summary: mockSummary } : e
                ));
            } else {
                const summary = await onFetchSummary(ep.id);
                setEpisodes(prev => prev.map(e =>
                    e.id === ep.id ? { ...e, summary } : e
                ));
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingMap(prev => ({ ...prev, [ep.id]: false }));
        }
    };

    return {
        mode,
        moviePlot: fetchedPlot, // Use the fetched plot or the prop
        isSearching,
        episodes,
        loadingMap,
        displayPrompt,
        expandSummary
    };
};
