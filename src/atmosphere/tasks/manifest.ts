import { AIRManifest } from '../types';
import { TasksAIR } from './TasksAIR';

export const TasksManifest: AIRManifest = {
    id: 'tasks-air',
    component: TasksAIR,
    meta: {
        title: 'Task Manager',
        icon: '✅',
        description: 'Track to-do items.',
        width: 350,
        height: 450
    }
};
