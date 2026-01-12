/// <reference types="vitest/globals" />
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { View } from '../view';


describe('InfoGridAIR View', () => {
    const mockToggle = vi.fn();
    const items = [
        { id: 1, title: 'Item 1', description: 'Desc 1' },
        { id: 2, title: 'Item 2', description: 'Desc 2' }
    ];

    it('renders items', () => {
        render(
            <View
                items={items}
                columns={1}
                collapsible={false}
                loadingText="Loading..."
                expandedId={null}
                onToggle={mockToggle}
            />
        );

        expect(screen.getByText('Item 1')).toBeInTheDocument();
        expect(screen.getByText('Desc 1')).toBeInTheDocument();
    });

    it('handles toggle interactions', () => {
        render(
            <View
                items={items}
                columns={1}
                collapsible={true}
                loadingText="Loading..."
                expandedId={null}
                onToggle={mockToggle}
            />
        );

        fireEvent.click(screen.getByText('Item 1'));
        expect(mockToggle).toHaveBeenCalledWith(1);
    });
});
