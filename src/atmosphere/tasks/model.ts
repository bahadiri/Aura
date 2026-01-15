import { useState, useEffect } from 'react';
import { flux } from '../../flux';


export interface TaskItem {
    id: string | number;
    label: string;
    completed: boolean;
}

export interface TasksAIRProps {
    initialTasks?: TaskItem[];
    title?: string;
    windowId?: string;
    updateWindow?: (data: any) => void;
}

export const useTasks = (props: TasksAIRProps) => {
    const { initialTasks = [], title = "TASKS", windowId, updateWindow } = props;
    const [tasks, setTasks] = useState<TaskItem[]>(initialTasks);

    // Sync from props if they change (e.g. Chat adds a task)
    useEffect(() => {
        if (props.initialTasks) {
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
                        to: 'controller'
                    });
                }
                return updated;
            }
            return t;
        });
        setTasks(newTasks);
        persist(newTasks);
    };

    return {
        tasks,
        title,
        toggleTask
    };
};
