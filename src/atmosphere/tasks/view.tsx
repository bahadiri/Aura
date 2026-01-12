import React from 'react';
import styles from '../../styles/aur.module.css';
import { TaskItem } from './model';

interface ViewProps {
    tasks: TaskItem[];
    title: string;
    onToggleTask: (id: string | number) => void;
}

export const View: React.FC<ViewProps> = ({
    tasks,
    title,
    onToggleTask
}) => {
    return (
        <div className={styles.screenContent}>
            <div className={styles.aurSectionTitle}>{title}</div>
            <div className={styles.scrollArea}>
                <div className={styles.tasksList}>
                    {tasks.map(task => (
                        <div
                            key={task.id}
                            className={`${styles.taskItem} ${task.completed ? styles.completed : ''}`}
                            onClick={() => onToggleTask(task.id)}
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
