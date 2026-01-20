/// <reference types="vitest/globals" />
import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import View from '../ui';

describe('TasksAIR View', () => {
    const tasks = [{ id: 1, label: 'Task 1', completed: false }];

    it('renders tasks', () => {
        const { getByText } = render(
            <View tasks={tasks} title="Tasks" onToggleTask={() => { }} />
        );
        expect(getByText('Task 1')).toBeInTheDocument();
    });

    it('handles toggle', () => {
        const mockToggle = vi.fn();
        const { getByText } = render(
            <View tasks={tasks} title="Tasks" onToggleTask={mockToggle} />
        );
        fireEvent.click(getByText('Task 1'));
        expect(mockToggle).toHaveBeenCalledWith(1);
    });
});
