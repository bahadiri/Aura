import { AIRManifest } from '../types';
import { SeriesEpisodesAIR } from './SeriesEpisodesAIR';

export const SeriesEpisodesManifest: AIRManifest = {
    id: 'series-episodes-air',
    component: SeriesEpisodesAIR,
    meta: {
        title: 'Series Episodes',
        icon: '🎬',
        description: 'Episode list with lazy loading summaries.',
        width: 450,
        height: 600
    }
};
