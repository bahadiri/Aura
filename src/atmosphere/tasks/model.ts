import { useState } from 'react';

export interface TaskItem {
    id: string | number;
    label: string;
    completed: boolean;
}

export interface TasksAIRProps {
    initialTasks?: TaskItem[];
    title?: string;
}

export const useTasks = ({ initialTasks = [], title = "TASKS" }: TasksAIRProps) => {
    const [tasks, setTasks] = useState<TaskItem[]>(initialTasks);

    const toggleTask = (id: string | number) => {
        setTasks(prev => prev.map(t =>
            t.id === id ? { ...t, completed: !t.completed } : t
        ));
    };

    return {
        tasks,
        title,
        toggleTask
    };
};
