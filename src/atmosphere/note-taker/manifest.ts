import { AIRManifest } from '../types';
import { NoteTakerAIR } from './NoteTakerAIR';

export const NoteTakerManifest: AIRManifest = {
    id: 'note-taker-air',
    component: NoteTakerAIR,
    meta: {
        title: 'Sticky Note',
        icon: '📝',
        description: 'Simple scratchpad for text.',
        width: 300,
        height: 300
    }
};
