/// <reference types="vitest/globals" />
import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { View } from '../view';

describe('NoteTakerAIR View', () => {
    it('renders textarea with value', () => {
        const mockSetInfo = vi.fn();
        const { getByDisplayValue } = render(
            <View value="Test Note" setValue={mockSetInfo} placeholder="Hold" />
        );
        expect(getByDisplayValue('Test Note')).toBeInTheDocument();
    });

    it('updates value on change', () => {
        const mockSetInfo = vi.fn();
        const { getByPlaceholderText } = render(
            <View value="" setValue={mockSetInfo} placeholder="Hold" />
        );
        fireEvent.change(getByPlaceholderText('Hold'), { target: { value: 'New' } });
        expect(mockSetInfo).toHaveBeenCalledWith('New');
    });
});
