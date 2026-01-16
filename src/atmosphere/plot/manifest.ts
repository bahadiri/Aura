import { AIRManifest } from '../types';
import { Component } from './index';

export const PlotManifest: AIRManifest = {
    id: 'plot-air',
    component: Component,
    meta: {
        title: 'Content Details',
        icon: '🎬',
        description: 'Displays plot summaries for movies and series.',
        width: 450,
        height: 600
    }
};
