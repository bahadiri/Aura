import React from 'react';
import { useSeriesEpisodes, Episode } from './model';
import { View } from './view';

export interface SeriesEpisodesAIRProps {
    seriesId?: string;
    seriesTitle?: string;
    episodes?: Episode[];
    onFetchSummary?: (episodeId: string | number) => Promise<string>;
    language?: string;
    prompt?: string;
}

export const SeriesEpisodesAIR: React.FC<SeriesEpisodesAIRProps> = ({
    seriesId = '',
    seriesTitle = 'Series',
    episodes: initialEpisodes = [],
    onFetchSummary,
    language = 'en',
    prompt: initialPrompt = '' // Fix: Default to empty string
}) => {
    // Logic & State (Model)
    const {
        episodes,
        loadingMap,
        displayPrompt,
        expandSummary
    } = useSeriesEpisodes({
        initialEpisodes,
        onFetchSummary,
        language,
        prompt: initialPrompt
    });

    // Render (View)
    return (
        <View
            seriesTitle={seriesTitle}
            displayPrompt={displayPrompt}
            episodes={episodes}
            loadingMap={loadingMap}
            onExpandSummary={expandSummary}
        />
    );
};
