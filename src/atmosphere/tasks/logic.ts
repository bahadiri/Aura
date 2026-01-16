import { useState, useEffect } from 'react';
import { flux } from '../../flux';
import { useAura } from '../../sdk'; // Correct SDK import
import { TaskItem, TasksUIProps } from './ui';

export interface UseTasksProps {
    initialTasks?: TaskItem[];
    title?: string;
    windowId?: string;
    updateWindow?: (data: any) => void;
}

export const useTasksLogic = (props: UseTasksProps) => {
    const { proxy, llm } = useAura(); // Access SDK capabilities
    const { initialTasks = [], title = "TASKS", windowId, updateWindow } = props;
    const [tasks, setTasks] = useState<TaskItem[]>(initialTasks);

    // Sync from props
    useEffect(() => {
        if (props.initialTasks && Array.isArray(props.initialTasks)) {
            setTasks(props.initialTasks);
        }
    }, [props.initialTasks]);

    const persist = (newTasks: TaskItem[]) => {
        if (updateWindow) {
            updateWindow({ props: { ...props, initialTasks: newTasks } });
        }
    };

    const toggleTask = (id: string | number) => {
        const newTasks = tasks.map(t => {
            if (t.id === id) {
                const updated = { ...t, completed: !t.completed };
                if (updated.completed) {
                    // Notify Controller -> Chat
                    flux.dispatch({
                        type: 'TASK_COMPLETED',
                        payload: {
                            taskId: id,
                            taskLabel: t.label,
                            windowId
                        },
                        to: 'all'
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
            if (msg.type === 'ADD_TASK' && (msg.to === 'all' || msg.to === 'tasks-air')) {
                const label = msg.payload.label || msg.payload.task;
                if (label) {
                    addTask(label);
                }
            }
        });
        return unsubscribe;
    }, [tasks]);

    return {
        tasks,
        title,
        toggleTask,
        addTask
    };
};
