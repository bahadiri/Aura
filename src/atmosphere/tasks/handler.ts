import { flux } from '../../flux';
import { getStorage } from '../../storage';

// Note: Component is exported from index.tsx
// We can't re-export it here directly because .ts files can't import from .tsx in the same directory
// Consumers should import from './tasks/index.tsx' or use the barrel export from manifests.ts

/**
 * The Kitchen: Implementation of the TasksAIR logic.
 * Routes strictly typed MCP calls to internal Flux events or direct storage actions.
 */
export async function handleRequest(tool: string, args: any) {
    if (tool === 'create_task') {
        // Forward MCP tool call via Flux using the SAME tool name
        flux.dispatch({
            type: 'create_task',
            payload: args,
            to: 'tasks-air'
        });
        return { content: [{ type: 'text', text: `Task created: "${args.title}"` }] };

    } else if (tool === 'complete_task') {
        // Forward MCP tool call via Flux using the SAME tool name
        flux.dispatch({
            type: 'complete_task',
            payload: args,
            to: 'tasks-air'
        });
        return { content: [{ type: 'text', text: `Task completed.` }] };

    } else if (tool === 'list_tasks') {
        // Direct "Data-First" observation fallback (if injection fails)
        // Reads from the same collection as useTasksLogic
        try {
            // Logic.ts uses `tasks_${sessionId}`. 
            // Since we don't have session ID in this static context easily, we try default.
            // TODO: In Phase 3 (Integration), we inject the exact collection ID.
            const collection = 'tasks_default';
            const doc = await getStorage().documents.get<{ items: any[] }>(collection, 'main_list');
            return {
                content: [{ type: 'text', text: JSON.stringify(doc?.items || []) }]
            };
        } catch (e) {
            return { content: [{ type: 'text', text: "Failed to read tasks persistence." }] };
        }
    }

    throw new Error(`Unknown tool: ${tool}`);
}
