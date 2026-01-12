import React from 'react';
import { useTasks, TaskItem } from './model';
import { View } from './view';

export interface TasksAIRProps {
    initialTasks?: TaskItem[];
    title?: string;
}

export const TasksAIR: React.FC<TasksAIRProps> = (props) => {
    const { tasks, title, toggleTask } = useTasks(props);

    return (
        <View
            tasks={tasks}
            title={title}
            onToggleTask={toggleTask}
        />
    );
};
