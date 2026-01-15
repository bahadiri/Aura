import { AIRManifest } from '../types';
import { NoteTakerAIR } from './NoteTakerAIR';

export const NoteTakerManifest: AIRManifest = {
    id: 'note-taker-air',
    component: NoteTakerAIR,
    meta: {
        title: 'Notes',
        icon: '📝',
        description: 'Document-style note editor with AI polish.',
        width: 600,
        height: 700,
        startPosition: 'center'
    }
};
