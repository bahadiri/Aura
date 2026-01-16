export const resources = {
    ai: {
        editor: {
            id: 'gemini-editor',
            provider: 'llm',
            model: 'gemini-2.5-pro',
            mode: 'chat',
            systemPrompt: "You are an expert editor. Improve the clarity, grammar, and flow of the text provided. Maintain the original meaning. Output ONLY the polished text."
        },
        titler: {
            id: 'gemini-titler',
            provider: 'llm',
            model: 'gemini-2.5-pro',
            mode: 'chat', // Using a cheaper/faster model if available would be better, but standardizing on pro for now
            systemPrompt: "Generate a concise, engaging title (max 5 words) for the following note content. Output ONLY the title."
        }
    }
} as const;
