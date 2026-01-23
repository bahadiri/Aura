import { TasksManifest } from './manifest';
import { resources } from './resources';
import TasksUI from './ui';
import { useTasksLogic } from './logic';
import React from 'react';

// The Module Component
const TasksAIR: React.FC<any> = (props) => {
    const logic = useTasksLogic(props);

    const handlePopOut = () => {
        // Simple window open simulation for now
        // In a real app, this would use the 'updateWindow' prop to request a pop-out mode from the container
        // or literally open a window.
        window.open(window.location.href, '_blank', 'popup,width=400,height=600');
    };

    return (
        <TasksUI
            title={logic.title}
            tasks={logic.tasks}
            onToggleTask={logic.toggleTask}
            onAddTask={logic.addTask}
            onPopOut={handlePopOut}
        />
    );
};

export default {
    manifest: TasksManifest,
    resources,
    component: TasksAIR
};

export { TasksAIR as Component };
