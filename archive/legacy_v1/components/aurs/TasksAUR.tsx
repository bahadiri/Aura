import React from 'react';
import styles from './AURs.module.css';

export interface TaskItem {
    id: string | number;
    label: string;
    completed: boolean;
}

export interface TasksAURProps {
    tasks: TaskItem[];
    onToggle: (id: string | number) => void;
    title?: string;
}

export const TasksAUR: React.FC<TasksAURProps> = ({ tasks, onToggle, title = "TASKS" }) => {
    return (
        <div className={styles.screenContent}>
            <div style={{ marginBottom: 12, fontWeight: 700, opacity: 0.6, fontSize: '0.8rem', textTransform: 'uppercase' }}>{title}</div>
            <div className={styles.scrollArea}>
                <div className={styles.tasksList}>
                    {tasks.map(task => (
                        <div
                            key={task.id}
                            className={`${styles.taskItem} ${task.completed ? styles.completed : ''}`}
                            onClick={() => onToggle(task.id)}
                        >
                            <div className={styles.checkbox}>
                                {task.completed && <span style={{ color: 'white', fontSize: '12px' }}>✓</span>}
                            </div>
                            <span className={styles.taskLabel}>{task.label}</span>
                        </div>
                    ))}
                    {tasks.length === 0 && (
                        <div style={{ textAlign: 'center', opacity: 0.4, padding: 20 }}>No tasks allocated yet.</div>
                    )}
                </div>
            </div>
        </div>
    );
};
