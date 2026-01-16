import { TasksManifest } from './manifest';
import { resources } from './resources';
import TasksUI from './ui';
import { useTasksLogic } from './logic';
import React from 'react';

// The Module Component
const TasksAIR: React.FC<any> = (props) => {
    const logic = useTasksLogic(props);

    return (
        <TasksUI 
            title= { logic.title }
    tasks = { logic.tasks }
    onToggleTask = { logic.toggleTask }
    onAddTask = { logic.addTask }
        />
    );
};

export default {
    manifest: TasksManifest,
    resources,
    component: TasksAIR
};

export { TasksAIR as Component };
