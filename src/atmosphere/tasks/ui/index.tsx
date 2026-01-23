import React from 'react';
import styles from '../../../styles/aur.module.css';

export interface TaskItem {
    id: string | number;
    label: string;
    completed: boolean;
}

export interface TasksUIProps {
    title: string;
    tasks: TaskItem[];
    onToggleTask: (id: string | number) => void;
    onAddTask?: (label: string) => void;
    onPopOut?: () => void;
}

const TasksUI: React.FC<TasksUIProps> = ({
    title,
    tasks,
    onToggleTask,
    onAddTask,
    onPopOut
}) => {
    const [inputValue, setInputValue] = React.useState('');

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && inputValue.trim()) {
            onAddTask && onAddTask(inputValue);
            setInputValue('');
        }
    };

    return (
        <div className={styles.screenContent} style={{ paddingTop: 0 }}>
            <div className={styles.aurSectionTitle} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, marginBottom: 10 }}>
                <span>{title}</span>
                {onPopOut && (
                    <button
                        onClick={onPopOut}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '4px',
                            opacity: 0.6
                        }}
                        title="Pop Out"
                    >
                        ↗
                    </button>
                )}
            </div>

            <div className={styles.scrollArea} style={{ overflowY: 'auto', flex: 1, maxHeight: '100%' }}>
                <div className={styles.tasksList}>
                    {tasks.map(task => (
                        <div
                            key={task.id}
                            className={`${styles.taskItem} ${task.completed ? styles.completed : ''}`}
                            onClick={() => onToggleTask(task.id)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '8px 12px',
                                marginBottom: 8,
                                background: 'var(--bg-highlight)',
                                borderRadius: 8,
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            <div className={styles.checkbox} style={{
                                width: 20, height: 20,
                                borderWidth: '2px',
                                borderStyle: 'solid',
                                borderRadius: 4,
                                marginRight: 12,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: task.completed ? 'var(--accent-primary)' : 'transparent',
                                borderColor: task.completed ? 'var(--accent-primary)' : 'var(--text-primary)'
                            }}>
                                {task.completed && <span style={{ color: 'white', fontSize: '12px' }}>✓</span>}
                            </div>
                            <span className={styles.taskLabel} style={{
                                textDecoration: task.completed ? 'line-through' : 'none',
                                color: task.completed ? 'var(--text-secondary)' : 'var(--text-primary)'
                            }}>
                                {task.label}
                            </span>
                        </div>
                    ))}

                    {/* Add Task Input */}
                    <div style={{ marginTop: 15, borderTop: '1px solid var(--border-subtle)', paddingTop: 15 }}>
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="+ Add a task..."
                            style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: 8,
                                border: '1px solid var(--border-subtle)',
                                background: 'var(--bg-secondary)',
                                color: 'var(--text-primary)',
                                outline: 'none'
                            }}
                        />
                    </div>

                    {tasks.length === 0 && (
                        <div style={{ textAlign: 'center', opacity: 0.4, padding: 20, fontSize: '0.8rem' }}>No tasks yet. Add one or ask Chat to create a plan.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TasksUI;
