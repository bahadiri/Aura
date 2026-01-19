import { EDITOR_SYSTEM_PROMPT, TITLER_SYSTEM_PROMPT } from './prompts';

export const resources = {
    ai: {
        editor: {
            id: 'gemini-editor',
            provider: 'llm',
            model: 'gemini-2.5-pro',
            mode: 'chat',
            systemPrompt: EDITOR_SYSTEM_PROMPT
        },
        titler: {
            id: 'gemini-titler',
            provider: 'llm',
            model: 'gemini-2.5-pro',
            mode: 'chat', // Using a cheaper/faster model if available would be better, but standardizing on pro for now
            systemPrompt: TITLER_SYSTEM_PROMPT
        }
    }
} as const;

