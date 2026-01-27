import { AIRManifest } from '../types';

export const YoutubePlayerManifest: Omit<AIRManifest, 'component'> = {
    id: 'youtube-player-air',
    meta: {
        title: 'YouTube Player',
        icon: '▶️',
        description: 'Embeds a YouTube video.',
        width: 480,
        height: 320
    },
    discovery: {
        keywords: ['video', 'youtube', 'trailer', 'play', 'watch', 'movie'],
        category: 'media',
        priority: 60
    }
};
