import { AIRManifest } from '../types';

export const TasksManifest: Omit<AIRManifest, 'component'> = {
    id: 'tasks-air',
    meta: {
        title: 'Task Manager',
        icon: '✅',
        description: 'Track to-do items. You MUST use specific actions to modify the list: Use `add_task` with payload `{tasks: ["item"]}` to add items. Use `toggle_task` with payload `{task: "item"}` to mark items as complete. Do NOT just say you did it; you must emit the action.',
        width: 350,
        height: 450
    },
    instructions: {
        tasks: {
            'add_task': 'Add one or more items to the task list. Extract actionable items from the user\'s request. Payload must include `tasks` (array of strings).',
            'toggle_task': 'Mark a task as completed or incomplete.'
        }
    }
};
