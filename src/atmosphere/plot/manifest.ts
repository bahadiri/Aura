import { AIRManifest } from '../types';
import { PlotAIR } from './PlotAIR';

export const PlotManifest: AIRManifest = {
    id: 'plot-air',
    component: PlotAIR,
    meta: {
        title: 'Content Details',
        icon: '🎬',
        description: 'Displays plot summaries for movies and series.',
        width: 450,
        height: 600
    }
};
