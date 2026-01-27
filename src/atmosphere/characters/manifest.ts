import { AIRManifest } from '../types';

export const CharactersManifest: Omit<AIRManifest, 'component'> = {
    id: 'characters-air',
    meta: {
        title: 'Characters',
        icon: '👥',
        description: 'Character profiles grid.',
        width: 500,
        height: 500
    },
    discovery: {
        keywords: ['characters', 'cast', 'actors', 'people', 'who played', 'starring'],
        category: 'entertainment',
        priority: 70
    }
};
