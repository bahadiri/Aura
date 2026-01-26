import { handleRequest } from './handler';
import { flux } from '../../flux';

describe('TasksAIR Handler', () => {
    it('should dispatch ADD_TASK with correct payload', async () => {
        const messages: any[] = [];

        // Subscribe to flux to capture the message
        const unsubscribe = flux.subscribe((msg) => {
            messages.push(msg);
        });

        // Call handleRequest like ChatInterface does
        const result = await handleRequest('create_task', { title: 'Test Task' });

        // Verify the flux message was dispatched
        expect(messages.length).toBe(1);
        expect(messages[0].type).toBe('ADD_TASK');
        expect(messages[0].payload).toEqual({ task: 'Test Task' });
        expect(messages[0].to).toBe('tasks-air');

        // Verify the return value
        expect(result).toEqual({
            content: [{ type: 'text', text: 'Task created: "Test Task"' }]
        });

        unsubscribe();
    });

    it('should handle args with title property', async () => {
        const messages: any[] = [];

        const unsubscribe = flux.subscribe((msg) => {
            messages.push(msg);
        });

        await handleRequest('create_task', { title: 'flour' });

        expect(messages[0].payload.task).toBe('flour');

        unsubscribe();
    });
});
