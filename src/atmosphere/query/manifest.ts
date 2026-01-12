import { AIRManifest } from '../types';
import { QueryAIR } from './QueryAIR';

export const QueryManifest: AIRManifest = {
    id: 'query-air',
    component: QueryAIR,
    meta: {
        title: 'Search',
        icon: '🔍',
        description: 'Find information.',
        width: 400,
        height: 500
    }
};
