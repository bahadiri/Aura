import { AIRManifest } from '../types';
import { BrainstormAIR } from './BrainstormAIR';

export const BrainstormManifest: AIRManifest = {
    id: 'brainstorm-air',
    component: BrainstormAIR,
    meta: {
        title: 'Brainstorm',
        icon: '🧠',
        description: 'Collaborative AI thinking partner.',
        width: 600,
        height: 700,
        startPosition: 'center'
    },
    instructions: {
        system: "You are a helpful brainstorming assistant."
    }
};
