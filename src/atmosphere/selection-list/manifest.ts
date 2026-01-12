import { AIRManifest } from '../types';
import { SelectionListAIR } from './SelectionListAIR';

export const SelectionListManifest: AIRManifest = {
    id: 'selection-list-air',
    component: SelectionListAIR,
    meta: {
        title: 'Selection List',
        icon: '☑️',
        description: 'Generic list selection interface.',
        width: 350,
        height: 400
    }
};
