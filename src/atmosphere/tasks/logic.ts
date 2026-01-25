import { useState, useEffect } from 'react';
import { flux } from '../../flux';
import { useAura } from '../../sdk'; // Correct SDK import
import { getStorage } from '../../storage';
import { TaskItem, TasksUIProps } from './ui';

export interface UseTasksProps {
    initialTasks?: TaskItem[];
    title?: string;
    windowId?: string;
    updateWindow?: (data: any) => void;
}

export const useTasksLogic = (props: UseTasksProps) => {
    const { proxy, llm, sessionId } = useAura(); // Access SDK capabilities
    const { initialTasks = [], title = "TASKS", windowId, updateWindow } = props;

    // Use session-scoped collection to ensure fresh start on refresh
    const COLLECTION = `tasks_${sessionId || 'default'}`;
    const DOC_ID = 'main_list';

    // Load initial state from storage
    const loadFromStorage = async (): Promise<TaskItem[]> => {
        try {
            // We use a single document 'main_list' to store the array for atomicity
            const doc = await getStorage().documents.get<{ items: TaskItem[] }>(COLLECTION, DOC_ID);
            return doc?.items || initialTasks;
        } catch (e) {
            console.error("Failed to load tasks from Aura Storage", e);
            return initialTasks;
        }
    };

    const [tasks, setTasks] = useState<TaskItem[]>(initialTasks);

    // Initial Load & Session Change
    useEffect(() => {
        let mounted = true;
        loadFromStorage().then(loaded => {
            if (mounted && (loaded.length > 0 || initialTasks.length === 0)) {
                setTasks(loaded);
            }
        });
        return () => { mounted = false; };
    }, [sessionId]);

    const persist = async (newTasks: TaskItem[]) => {
        try {
            // Upsert the main list document
            // We can use create or update. FileSystemAdapter 'create' appends if not exists.
            // But we want to overwrite the specific DOC_ID.
            const exists = await getStorage().documents.get(COLLECTION, DOC_ID);
            if (exists) {
                await getStorage().documents.update(COLLECTION, DOC_ID, { items: newTasks });
            } else {
                await getStorage().documents.create(COLLECTION, { id: DOC_ID, items: newTasks });
            }
        } catch (e) {
            console.error("Persist failed", e);
        }
    };

    // Listen for Flux Changes (Optimistic Updates)
    // We already have local state 'tasks'. When we update 'tasks', we call persist.
    // Ensure all instances share state via Flux if possible, but for now relying on single-source-of-truth 
    // + optimistic updates from ChatInterface is key.

    const toggleTask = (id: string | number) => {
        // Optimistic update
        const newTasks = tasks.map((t, index) => {
            if (t.id === id) {
                const updated = { ...t, completed: !t.completed };
                if (updated.completed) {
                    // Defer dispatch to avoid setState during render
                    queueMicrotask(() => {
                        flux.dispatch({
                            type: 'TASK_COMPLETED',
                            payload: { taskId: id, taskLabel: t.label, windowId, taskOrder: index },
                            to: 'all'
                        });
                    });
                }
                return updated;
            }
            return t;
        });
        setTasks(newTasks);
        persist(newTasks);
    };

    const addTask = (label: string) => {
        const newTask: TaskItem = {
            id: crypto.randomUUID(),
            label,
            completed: false
        };
        const newTasks = [...tasks, newTask];
        setTasks(newTasks);
        persist(newTasks);
    };

    // Listen for Chat Commands
    useEffect(() => {
        const unsubscribe = flux.subscribe((msg: any) => {
            console.log(`[TasksAIR ${windowId || 'inline'}] Flux Msg:`, msg.type);

            if (msg.type === 'ADD_TASK' && (msg.to === 'all' || msg.to === 'tasks-air')) {
                let itemsToAdd: string[] = [];
                // Robust parsing of payload
                if (Array.isArray(msg.payload.tasks)) itemsToAdd = msg.payload.tasks;
                else if (Array.isArray(msg.payload.items)) itemsToAdd = msg.payload.items;
                else if (msg.payload.label) itemsToAdd = [msg.payload.label];
                else if (msg.payload.task) itemsToAdd = [msg.payload.task];

                console.log(`[TasksAIR] Adding items:`, itemsToAdd);

                if (itemsToAdd.length > 0) {
                    const newItems = itemsToAdd.map(label => ({
                        id: crypto.randomUUID(),
                        label,
                        completed: false
                    }));

                    // Use functional update to get latest state from closure
                    setTasks(prev => {
                        const updated = [...prev, ...newItems];
                        persist(updated); // Persist the new state

                        // Dispatch TASK_ADDED event for each new task
                        newItems.forEach(item => {
                            queueMicrotask(() => {
                                console.log(`[TasksAIR] Dispatching TASK_ADDED:`, item.label);
                                flux.dispatch({
                                    type: 'TASK_ADDED',
                                    payload: { taskId: item.id, label: item.label, windowId },
                                    to: 'all'
                                });
                            });
                        });

                        return updated;
                    });
                }
            } else if (msg.type === 'TOGGLE_TASK' && (msg.to === 'all' || msg.to === 'tasks-air')) {
                const targetLabel = msg.payload.label || msg.payload.task;
                const targetId = msg.payload.id; // New: Support exact ID match

                if (!targetLabel && !targetId) {
                    console.error('[TasksAIR] TOGGLE_TASK missing label/task/id in payload:', msg.payload);
                    return;
                }

                console.log(`[TasksAIR] Toggling: ${targetId || targetLabel}`);

                setTasks(prev => {
                    const newTasks = prev.map((t, index) => {
                        // Priority: Exact ID match > Fuzzy Label match
                        const match = targetId ? t.id === targetId : t.label.toLowerCase().includes(targetLabel.toLowerCase());

                        if (match) {
                            // If already completed, don't toggle off (idempotent)
                            if (t.completed) {
                                console.log(`[TasksAIR] Task already completed, skipping toggle: ${t.label}`);
                                return t;
                            }
                            const updated = { ...t, completed: true };
                            // Defer dispatch to avoid setState during render
                            queueMicrotask(() => {
                                console.log(`[TasksAIR] Dispatching TASK_COMPLETED for task at index ${index}:`, t.label);
                                flux.dispatch({
                                    type: 'TASK_COMPLETED',
                                    payload: { taskId: t.id, taskLabel: t.label, windowId, taskOrder: index },
                                    to: 'all'
                                });
                            });
                            return updated;
                        }
                        return t;
                    });
                    persist(newTasks);
                    return newTasks;
                });
            } else if (msg.type === 'UPDATE_TASK' && (msg.to === 'all' || msg.to === 'tasks-air')) {
                const targetLabel = msg.payload.label || msg.payload.task;
                const newLabel = msg.payload.newLabel;
                if (!targetLabel || !newLabel) return;
                setTasks(prev => {
                    const newTasks = prev.map(t => {
                        if (t.label.toLowerCase().includes(targetLabel.toLowerCase())) {
                            return { ...t, label: newLabel };
                        }
                        return t;
                    });
                    persist(newTasks);
                    return newTasks;
                });
            } else if (msg.type === 'REQUEST_CONTEXT') {
                // Generic Generic Context Provider
                // Broadcast full state so Chat can see what we have
                flux.dispatch({
                    type: 'PROVIDE_CONTEXT',
                    payload: {
                        id: 'tasks-air',
                        context: { tasks }
                    },
                    to: 'all'
                });
            }
        });
        return unsubscribe;
    }, [tasks]); // Add 'tasks' dependency so we always send latest state

    return {
        tasks,
        title,
        toggleTask,
        addTask
    };
};
