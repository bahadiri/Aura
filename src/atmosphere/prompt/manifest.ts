import { AIRManifest } from '../types';
import { PromptAIR } from './PromptAIR';

export const PromptManifest: AIRManifest = {
    id: 'prompt-air',
    component: PromptAIR,
    meta: {
        title: 'Prompt Viewer',
        icon: '📜',
        description: 'Displays generated prompts.',
        width: 500,
        height: 400
    }
};
