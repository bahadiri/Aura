import { useState } from 'react';

export interface Episode {
    id: string | number;
    season: number;
    episode: number;
    title: string;
    summary?: string;
}

interface UseSeriesEpisodesProps {
    initialEpisodes: Episode[];
    onFetchSummary?: (episodeId: string | number) => Promise<string>;
    language: string;
    prompt: string;
}

export const useSeriesEpisodes = ({ initialEpisodes, onFetchSummary, language, prompt }: UseSeriesEpisodesProps) => {
    const [episodes, setEpisodes] = useState<Episode[]>(initialEpisodes);
    const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});

    // User requested to not translate the prompt itself, just pass language context.
    // So displayPrompt is just the raw prompt.
    const displayPrompt = prompt;

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
        episodes,
        loadingMap,
        displayPrompt,
        expandSummary
    };
};
