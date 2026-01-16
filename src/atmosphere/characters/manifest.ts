import { AIRManifest } from '../types';

export const CharactersManifest: Omit<AIRManifest, 'component'> = {
    id: 'characters-air',
    meta: {
        title: 'Characters',
        icon: '👥',
        description: 'Character profiles grid.',
        width: 500,
        height: 500
    }
};
