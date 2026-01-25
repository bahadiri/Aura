import { flux } from '../../flux';
import { getStorage } from '../../storage';

/**
 * The Kitchen: Implementation of the TasksAIR logic.
 * Routes strictly typed MCP calls to internal Flux events or direct storage actions.
 */
export async function handleRequest(tool: string, args: any) {
    if (tool === 'create_task') {
        const title = args.title;
        // Dispatch to internal UI logic
        flux.dispatch({
            type: 'ADD_TASK',
            payload: { task: title },
            to: 'tasks-air'
        });
        return { content: [{ type: 'text', text: `Task created: "${title}"` }] };

    } else if (tool === 'complete_task') {
        const id = args.id;
        // The current Flux logic uses 'label' for toggling because IDs aren't fully stable in V1.
        // For V2 reference implementation, we'll try to use the label from args if ID isn't found, 
        // effectively matching the 'toggle_task' logic of legacy.

        flux.dispatch({
            type: 'TOGGLE_TASK',
            payload: { task: id }, // Legacy logic receives 'task' which acts as label matcher
            to: 'tasks-air'
        });
        return { content: [{ type: 'text', text: `Task completed via signal.` }] };

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
