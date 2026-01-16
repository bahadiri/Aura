export const resources = {
    api: {
        firestore: {
            tasks: {
                id: 'firestore-tasks',
                provider: 'proxy',
                config: {
                    // Assuming we have a backend proxy endpoint for firestore operations or a direct REST API
                    // Standard Saga pattern for persistence is via `updateWindow` which saves to `Project` state in Firestore.
                    // However, if we want independent collections (e.g. /tasks), we need an endpoint.
                    // BUT, `TasksAIR` currently uses `initialTasks` prop which comes from `updateWindow` persistence (stored in Project JSON).
                    // So we might NOT need a specific fetch resource if we rely on Project state.
                    // Let's stick to Project State persistence via `updateWindow` for now as it's simplest for "Saga".
                    // But if we want detailed "Chat-to-Task" where AI creates tasks, we need a way to push.
                    // Actually, Chat creates tasks via `flux` actions or `updateWindow` if it modifies the message attachment.
                    // Let's define a placeholder for future if needed, but for now rely on props.
                }
            }
        },
        ai: {
            planner: {
                id: 'gemini-task-planner',
                provider: 'llm',
                model: 'gemini-2.5-pro',
                mode: 'chat',
                systemPrompt: "You are an expert project manager. Break down user requests into actionable tasks."
            }
        }
    }
} as const;
