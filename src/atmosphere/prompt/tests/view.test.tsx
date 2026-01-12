/// <reference types="vitest/globals" />
import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { View } from '../view';

describe('PromptAIR View', () => {
    it('renders prompt text', () => {
        const { getByText } = render(
            <View
                prompt="Generated Prompt"
                title="Title"
                copied={false}
                loadingText="Loading"
                onCopy={() => { }}
            />
        );
        expect(getByText('Generated Prompt')).toBeInTheDocument();
    });

    it('shows loading state', () => {
        const { getByText } = render(
            <View
                prompt=""
                title="Title"
                isLoading={true}
                loadingText="Wait..."
                copied={false}
                onCopy={() => { }}
            />
        );
        expect(getByText('Wait...')).toBeInTheDocument();
    });
});
