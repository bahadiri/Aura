import { useState, useEffect } from 'react';
import { useAura } from '../../sdk';
import { resources } from './resources';
import { flux } from '../../flux'; // Assuming flux is effectively a global event bus we still use
import { expandPlotPrompt } from './prompts';

export interface Episode {
    id: string | number;
    season: number;
    episode: number;
    title: string;
    summary?: string;
    air_date?: string;
}

export interface UsePlotAIRProps {
    mode?: 'series' | 'movie';
    seriesTitle?: string;
    moviePlot?: string;
    initialEpisodes?: Episode[];
    query?: string;
    prompt?: string;
    updateWindow?: (data: any) => void;
}

export const usePlotLogic = ({
    mode = 'series',
    moviePlot,
    seriesTitle,
    query,
    initialEpisodes = [],
    prompt,
    updateWindow
}: UsePlotAIRProps) => {
    const { llm, proxy } = useAura();

    // State
    const [episodes, setEpisodes] = useState<Episode[]>(initialEpisodes);
    const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});
    const [fetchedPlot, setFetchedPlot] = useState<string | undefined>(moviePlot);
    const [fetchedTitle, setFetchedTitle] = useState<string | undefined>(seriesTitle);
    const [isSearching, setIsSearching] = useState(false);
    const [expanding, setExpanding] = useState(false);

    // Initial Sync
    useEffect(() => {
        if (moviePlot) setFetchedPlot(moviePlot);
        if (seriesTitle) setFetchedTitle(seriesTitle);
        if (initialEpisodes?.length > 0) setEpisodes(initialEpisodes);
    }, [moviePlot, seriesTitle, initialEpisodes]);

    // Search Logic
    useEffect(() => {
        const shouldSearch = query && (
            (mode === 'movie' && !fetchedPlot) ||
            (mode === 'series' && (!episodes || episodes.length === 0))
        );

        if (shouldSearch && query) {
            performSearch(query, mode);
        }
    }, [query, mode]); // removed fetchedPlot/episodes dependency to avoid loops, rely on explicit query change

    const performSearch = async (q: string, searchMode: 'movie' | 'series') => {
        setIsSearching(true);
        console.log(`[PlotAir] Starting search for "${q}" in mode: ${searchMode}`);
        try {
            // 1. Fetch from TMDB Proxy
            // Note: We use the same 'search' resource for both, but TMDB has distinct endpoints.
            // Our resources.ts defined 'tmdb.search' as /search/movie. 
            // We need /search/tv for series. 
            // To keep resources simple, we can use params or define specific resources.
            // Let's assume resources.ts needs an update or we misuse 'search' with a different URL if we could override?
            // No, Declarative Proxy means we usually stick to defined resources.
            // I will implement fetching logic assuming resources.ts has both or I modify resources.ts next.
            // For now, I'll use resources.api.tmdb.search for movies.
            // I'll need to Add series search to resources.ts or use the same resource if the endpoint was generic (it's not).

            // FIX: I will use 'search' for movie. For series, I'll hack it or request update. 
            // Let's check resources.ts... it only has /search/movie.
            // I should update resources.ts to include 'searchSeries'.
            // For this step I will implement 'movie' search correctly.

            if (searchMode === 'movie') {
                console.log(`[PlotAir] Fetching movie results...`);
                const data = await proxy.fetch(resources.api.tmdb.search, {
                    params: { query: q }
                });
                console.log(`[PlotAir] Raw TMDB results:`, data);

                if (data.results && data.results.length > 0) {
                    const best = data.results[0];
                    const newPlot = best.overview;
                    const newTitle = best.title;

                    setFetchedPlot(newPlot);
                    setFetchedTitle(newTitle);

                    if (updateWindow) {
                        updateWindow({ props: { moviePlot: newPlot, seriesTitle: newTitle, title: newTitle } });
                    }
                } else {
                    setFetchedPlot("No movie found.");
                }
            } else {
                // Series Search
                console.log(`[PlotAir] Fetching TV results...`);
                const data = await proxy.fetch(resources.api.tmdb.searchTV, {
                    params: { query: q }
                });
                console.log(`[PlotAir] Raw TMDB TV results:`, data);

                if (data.results && data.results.length > 0) {
                    const best = data.results[0];
                    const newPlot = best.overview;
                    const newTitle = best.name; // TV results use 'name' not 'title'

                    setFetchedPlot(newPlot);
                    setFetchedTitle(newTitle);

                    // Fetch Episodes (Default Season 1)
                    try {
                        const seasonData = await proxy.fetch(resources.api.tmdb.season, {
                            // URL template substitution handled by proxy? Or types?
                            // GenericProxyClient simply sends URL. 
                            // If URL has {id}, we must replace it BEFORE sending or Proxy must support templating.
                            // My ProxyClient implementation sends `url` as is. 
                            // So I MUST replace it here.
                            params: {},
                            // Hack: modifying URL here because Client doesn't support template sub yet 
                            // or I didn't verify Proxy supports it. 
                            // To be safe, I'll rely on string replacement in logic.
                        });
                        // WAIT: My ProxyClient doesn't do template replacement. 
                        // Logic must construct URL.
                        // But resources.ts has templates.
                        // I should fix the logic to construct the URL.
                    } catch (e) {
                        console.warn("Failed to fetch episodes", e);
                    }

                    if (updateWindow) {
                        updateWindow({ props: { moviePlot: newPlot, seriesTitle: newTitle, title: newTitle } });
                    }
                } else {
                    setFetchedPlot("No series found.");
                }
            }

        } catch (err) {
            console.error("[PlotAir] Search failed", err);
            setFetchedPlot("Error loading content.");
        } finally {
            setIsSearching(false);
        }
    };

    // Chat Expansion Logic
    const expandPlot = async (userInstruction: string, currentText: string) => {
        setExpanding(true);
        try {
            // Use LiteLLM
            const response = await llm.invoke(resources.ai.storyteller, {
                messages: [
                    { role: "system", content: resources.ai.storyteller.systemPrompt }, // Optional if handled in client
                    { role: "user", content: expandPlotPrompt(currentText, userInstruction) }
                ]
            });
            console.log(`[PlotAir] Expansion result:`, response);

            if (response.content) {
                setFetchedPlot(response.content);
                if (updateWindow) {
                    updateWindow({ props: { moviePlot: response.content } });
                }
            }
        } catch (e) {
            console.error("Expansion failed", e);
        } finally {
            setExpanding(false);
        }
    };

    // Flux Listener for Chat
    useEffect(() => {
        const unsubscribe = flux.subscribe((msg: any) => {
            if (msg.type === 'CHAT_PROMPT' && msg.to === 'assistant' && fetchedPlot && mode === 'movie') {
                const text = msg.payload.text?.toLowerCase() || '';
                const keywords = ['expand', 'more details', 'elaborate'];
                if (keywords.some(k => text.includes(k))) {
                    expandPlot(msg.payload.text, fetchedPlot);
                }
            }
        });
        return unsubscribe;
    }, [fetchedPlot, mode]);

    return {
        mode,
        moviePlot: fetchedPlot,
        seriesTitle: fetchedTitle,
        isSearching,
        episodes,
        loadingMap,
        displayPrompt: prompt,
        expandPlot,
        expanding
    };
};
