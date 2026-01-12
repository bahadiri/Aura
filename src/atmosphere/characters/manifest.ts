import { AIRManifest } from '../types';
import { CharactersAIR } from './CharactersAIR';

export const CharactersManifest: AIRManifest = {
    id: 'characters-air',
    component: CharactersAIR,
    meta: {
        title: 'Characters',
        icon: '👥',
        description: 'Character profiles grid.',
        width: 500,
        height: 500
    }
};
