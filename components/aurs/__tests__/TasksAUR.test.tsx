import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TasksAUR } from '../TasksAUR';
import React from 'react';

describe('TasksAUR', () => {
    const tasks = [
        { id: 1, label: 'Task 1', completed: false },
        { id: 2, label: 'Task 2', completed: true }
    ];

    it('renders task list', () => {
        render(<TasksAUR tasks={tasks} onToggle={vi.fn()} />);
        expect(screen.getByText('Task 1')).toBeInTheDocument();
        expect(screen.getByText('Task 2')).toBeInTheDocument();
    });

    it('calls onToggle when a task is clicked', () => {
        const onToggle = vi.fn();
        render(<TasksAUR tasks={tasks} onToggle={onToggle} />);

        fireEvent.click(screen.getByText('Task 1'));
        expect(onToggle).toHaveBeenCalledWith(1);
    });

    it('shows checkmark for completed tasks', () => {
        render(<TasksAUR tasks={tasks} onToggle={vi.fn()} />);
        // Task 2 is completed, so it should have a checkmark
        expect(screen.getByText('✓')).toBeInTheDocument();
    });
});
