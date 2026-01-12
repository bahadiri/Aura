import { AIRManifest } from '../types';
import { InfoGridAIR } from './InfoGridAIR';

export const InfoGridManifest: AIRManifest = {
    id: 'info-grid-air',
    component: InfoGridAIR,
    meta: {
        title: 'Info Grid',
        icon: '🧊',
        description: 'Structured data display.',
        width: 600,
        height: 500
    }
};
