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
    prompt,
    updateWindow
}: UsePlotAIRProps & { query?: string; updateWindow?: (data: any) => void }) => {
    const [episodes, setEpisodes] = useState<Episode[]>(initialEpisodes);
    const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});
    const [fetchedPlot, setFetchedPlot] = useState<string | undefined>(moviePlot);
    const [isSearching, setIsSearching] = useState(false);

    const displayPrompt = prompt;

    // Search for movie plot if needed
    useEffect(() => {
        if (mode === 'movie' && !moviePlot && query) {
            setIsSearching(true);
            const port = import.meta.env.VITE_SAGA_BACKEND_PORT || '8001';
            fetch(`http://localhost:${port}/api/search?q=${encodeURIComponent(query)}`)
                .then(res => res.json())
                .then(data => {
                    let newPlot = "";
                    if (data.results && data.results.length > 0) {
                        const bestMatch = data.results[0];
                        if (bestMatch.overview) {
                            newPlot = bestMatch.overview;
                        } else {
                            newPlot = `Found movie: ${bestMatch.title}. (Plot unavailable)`;
                        }
                    } else {
                        newPlot = "Could not find plot for: " + query;
                    }

                    setFetchedPlot(newPlot);

                    if (updateWindow && newPlot) {
                        updateWindow({ props: { moviePlot: newPlot } });
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
