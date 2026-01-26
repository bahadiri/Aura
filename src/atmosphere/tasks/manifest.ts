import { AIRManifest } from '../types';
import manifestJson from './aura.manifest.json';
import { handleRequest } from './handler';

/**
 * TasksAIR Manifest
 *
 * Reference implementation demonstrating:
 * - MCP tool definitions (via aura.manifest.json)
 * - Discovery metadata for semantic search
 * - State schema for Data-First observation
 * - handleRequest "Kitchen" pattern
 */
export const TasksManifest: Omit<AIRManifest, 'component'> = {
    id: 'tasks-air',

    meta: {
        title: 'Task Manager',
        icon: '✅',
        description: 'Track to-do items. Use this to manage the user\'s backlog.',
        width: 350,
        height: 450
    },

    // Discovery metadata for hierarchical selection
    discovery: {
        keywords: [
            'task', 'todo', 'checklist', 'productivity',
            'organize', 'backlog', 'complete', 'finish',
            'work', 'item', 'list', 'grocery', 'shopping',
            'create', 'make', 'add', 'movie', 'write'
        ],
        category: 'productivity',
        subcategory: 'task-management',
        priority: 90, // High priority - core productivity tool
        tags: ['agile', 'personal', 'workspace']
    },

    // State schema for Data-First observation
    stateSchema: {
        collection: 'tasks_{sessionId}',
        documentId: 'main_list',
        schema: {
            type: 'object',
            properties: {
                items: {
                    type: 'array',
                    description: 'Array of task items',
                    items: {
                        type: 'object',
                        properties: {
                            id: {
                                type: 'string',
                                description: 'Unique task identifier (UUID)'
                            },
                            label: {
                                type: 'string',
                                description: 'Task description/title'
                            },
                            completed: {
                                type: 'boolean',
                                description: 'Whether task is completed'
                            }
                        },
                        required: ['id', 'label', 'completed']
                    }
                }
            },
            required: ['items']
        },
        description: 'Task list state persisted in Aura Storage. The LLM can read this raw data to understand task status without requiring separate "count" or "list" tools.'
    },

    // MCP Tools (imported from aura.manifest.json)
    tools: manifestJson.tools as any,

    // Implementation: The "Kitchen"
    logic: { handleRequest }
};

