import { useState, useEffect } from 'react';
import { flux } from '../../flux';

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
    onFetchSummary?: (episodeId: string | number) => Promise<string>;
    language?: string;
    prompt?: string;
    query?: string;
    updateWindow?: (data: any) => void;
}

export const usePlotAIR = ({
    mode = 'series',
    moviePlot,
    seriesTitle,
    query,
    initialEpisodes = [],
    onFetchSummary,
    language,
    prompt,
    updateWindow
}: UsePlotAIRProps) => {
    const [episodes, setEpisodes] = useState<Episode[]>(initialEpisodes);
    const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});
    const [fetchedPlot, setFetchedPlot] = useState<string | undefined>(moviePlot);
    const [isSearching, setIsSearching] = useState(false);
    const [fetchedTitle, setFetchedTitle] = useState<string | undefined>(seriesTitle);
    const [expanding, setExpanding] = useState(false);

    const displayPrompt = prompt;

    useEffect(() => {
        if (moviePlot) setFetchedPlot(moviePlot);
        if (seriesTitle) setFetchedTitle(seriesTitle);
        if (initialEpisodes && initialEpisodes.length > 0) setEpisodes(initialEpisodes);

        const shouldSearch = query && (
            (mode === 'movie' && !moviePlot) ||
            (mode === 'series' && (!initialEpisodes || initialEpisodes.length === 0))
        );

        if (shouldSearch) {
            setIsSearching(true);
            const port = import.meta.env.VITE_SAGA_BACKEND_PORT || '8001';
            const baseUrl = import.meta.env.VITE_SAGA_API_URL || `http://localhost:${port}`;

            fetch(`${baseUrl}/api/search?q=${encodeURIComponent(query)}&mode=${mode}`)
                .then(res => res.json())
                .then(async data => {
                    if (data.results && data.results.length > 0) {
                        const bestMatch = data.results[0];

                        const newPlot = bestMatch.overview || `Found ${mode}: ${bestMatch.title || bestMatch.name}`;
                        const newTitle = bestMatch.title || bestMatch.name;

                        setFetchedPlot(newPlot);
                        setFetchedTitle(newTitle);

                        const updatePayload: any = { props: {} };
                        if (mode === 'movie') {
                            updatePayload.props.moviePlot = newPlot;
                            updatePayload.props.seriesTitle = newTitle;
                        } else {
                            updatePayload.props.moviePlot = newPlot;
                            updatePayload.props.seriesTitle = newTitle;
                        }

                        if (mode === 'series') {
                            try {
                                const epRes = await fetch(`${baseUrl}/api/search/episodes?series_id=${bestMatch.id}`);
                                const epData = await epRes.json();
                                if (epData.episodes) {
                                    setEpisodes(epData.episodes);
                                    updatePayload.props.initialEpisodes = epData.episodes;
                                }
                            } catch (e) {
                                console.error("Failed to fetch episodes", e);
                            }
                        }

                        if (updateWindow) {
                            updateWindow(updatePayload);
                        }

                    } else {
                        setFetchedPlot(`Could not find ${mode} for: ${query}`);
                    }
                })
                .catch(err => {
                    console.error("Plot search failed:", err);
                    setFetchedPlot("Failed to load content.");
                })
                .finally(() => setIsSearching(false));
        }
    }, [mode, moviePlot, seriesTitle, initialEpisodes, query]);

    // Chat-Driven Expansion: Listen for CHAT_PROMPT messages
    useEffect(() => {
        const unsubscribe = flux.subscribe((msg: any) => {
            // Only process chat prompts if we have a movie plot to expand
            if (msg.type === 'CHAT_PROMPT' && msg.to === 'assistant' && fetchedPlot && mode === 'movie') {
                const userMessage = msg.payload.text?.toLowerCase() || '';

                // Check if the message is asking to expand/elaborate on plot
                const plotKeywords = ['expand', 'more details', 'elaborate', 'tell me more about', 'explain'];
                const isPlotExpansionRequest = plotKeywords.some(keyword => userMessage.includes(keyword));

                if (isPlotExpansionRequest) {
                    console.log('[PlotAIR] Chat-driven expansion triggered:', userMessage);
                    expandPlot(msg.payload.text, fetchedPlot);
                }
            }
        });

        return unsubscribe;
    }, [fetchedPlot, mode]);

    const expandSummary = async (ep: Episode) => {
        if (ep.summary) return;

        setLoadingMap(prev => ({ ...prev, [ep.id]: true }));

        try {
            if (onFetchSummary) {
                const summary = await onFetchSummary(ep.id);
                setEpisodes(prev => prev.map(e =>
                    e.id === ep.id ? { ...e, summary } : e
                ));
            } else {
                await new Promise(resolve => setTimeout(resolve, 500));
                setEpisodes(prev => prev.map(e =>
                    e.id === ep.id ? { ...e, summary: "Details unavailable." } : e
                ));
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingMap(prev => ({ ...prev, [ep.id]: false }));
        }
    };

    const expandPlot = async (userQuery: string, currentText: string) => {
        setExpanding(true);
        try {
            const port = import.meta.env.VITE_SAGA_BACKEND_PORT || '8001';
            const baseUrl = import.meta.env.VITE_SAGA_API_URL || `http://localhost:${port}`;

            const res = await fetch(`${baseUrl}/api/search/expand`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: currentText,
                    query: userQuery,
                    mode: 'general'
                })
            });

            if (res.ok) {
                const data = await res.json();
                if (data.text) {
                    setFetchedPlot(data.text);
                    if (updateWindow) {
                        updateWindow({ props: { moviePlot: data.text } });
                    }
                }
            }
        } catch (e) {
            console.error("Expand failed", e);
        } finally {
            setExpanding(false);
        }
    };

    return {
        mode,
        moviePlot: fetchedPlot,
        seriesTitle: fetchedTitle,
        isSearching,
        episodes,
        loadingMap,
        displayPrompt,
        expandSummary,
        expandPlot,
        expanding
    };
};
