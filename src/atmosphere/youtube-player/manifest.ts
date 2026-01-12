import { AIRManifest } from '../types';
import { YoutubePlayerAIR } from './YoutubePlayerAIR';

export const YoutubePlayerManifest: AIRManifest = {
    id: 'youtube-player-air',
    component: YoutubePlayerAIR,
    meta: {
        title: 'YouTube Player',
        icon: '▶️',
        description: 'Embeds a YouTube video.',
        width: 480,
        height: 320
    }
};
