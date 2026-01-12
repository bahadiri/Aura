/// <reference types="vitest/globals" />
import React from 'react';
import { render } from '@testing-library/react';
import { View } from '../view';

describe('YoutubePlayerAIR View', () => {
    it('renders iframe when videoId provided', () => {
        const { container } = render(
            <View videoId="123" url="https://youtube.com/embed/123" />
        );
        expect(container.querySelector('iframe')).toBeInTheDocument();
    });

    it('renders error when no videoId', () => {
        const { getByText } = render(
            <View videoId={undefined} url={null} />
        );
        expect(getByText(/No Video ID/i)).toBeInTheDocument();
    });
});
