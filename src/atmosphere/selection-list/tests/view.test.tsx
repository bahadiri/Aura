/// <reference types="vitest/globals" />
import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { View } from '../view';

describe('SelectionListAIR View', () => {
    const items = ['Item A', 'Item B'];
    const keyExtractor = (item: string) => item;

    it('renders items', () => {
        const { getByText } = render(
            <View
                items={items}
                selectedIds={[]}
                onToggle={() => { }}
                keyExtractor={keyExtractor}
                emptyText="Empty"
            />
        );
        expect(getByText('Item A')).toBeInTheDocument();
    });

    it('handles interactions', () => {
        const mockToggle = vi.fn();
        const { getByText } = render(
            <View
                items={items}
                selectedIds={[]}
                onToggle={mockToggle}
                keyExtractor={keyExtractor}
                emptyText="Empty"
            />
        );
        fireEvent.click(getByText('Item A'));
        expect(mockToggle).toHaveBeenCalledWith('Item A');
    });
});
