import React from 'react';
import { useTasks, TaskItem, TasksAIRProps as ModelProps } from './model';
import { View } from './view';

export type TasksAIRProps = ModelProps;

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
