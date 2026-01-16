import { AIRManifest } from '../types';

export const TasksManifest: Omit<AIRManifest, 'component'> = {
    id: 'tasks-air',
    meta: {
        title: 'Task Manager',
        icon: '✅',
        description: 'Track to-do items.',
        width: 350,
        height: 450
    }
};
