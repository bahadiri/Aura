/// <reference types="vitest/globals" />
import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { View } from '../view';

describe('QueryAIR View', () => {
    it('renders search input', () => {
        const { getByPlaceholderText } = render(
            <View
                query=""
                setQuery={() => { }}
                isSearching={false}
                results={[]}
                placeholder="Search..."
            />
        );
        expect(getByPlaceholderText('Search...')).toBeInTheDocument();
    });

    it('renders results', () => {
        const { getByText } = render(
            <View
                query="test"
                setQuery={() => { }}
                isSearching={false}
                results={['Result 1']}
                placeholder="Search..."
            />
        );
        expect(getByText('Result 1')).toBeInTheDocument();
    });
});
