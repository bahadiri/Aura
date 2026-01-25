import { AIRManifest } from '../types';
import manifestJson from './aura.manifest.json';
import { handleRequest } from './index';

export const TasksManifest: Omit<AIRManifest, 'component'> = {
    id: 'tasks-air',
    meta: {
        title: 'Task Manager',
        icon: '✅',
        description: 'Track to-do items. Use this to manage the user\'s backlog.',
        width: 350,
        height: 450
    },
    tools: manifestJson.tools as any, // MCP Tools
    logic: { handleRequest }   // The Kitchen
};

