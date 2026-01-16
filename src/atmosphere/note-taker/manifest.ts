import { AIRManifest } from '../types';

export const NoteTakerManifest: Omit<AIRManifest, 'component'> = {
    id: 'note-taker-air',
    meta: {
        title: 'Notes',
        icon: '📝',
        description: 'Document-style note editor with AI polish.',
        width: 600,
        height: 700,
        startPosition: 'center'
    }
};
