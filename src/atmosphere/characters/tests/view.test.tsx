/// <reference types="vitest/globals" />
import { render } from '@testing-library/react';
import View from '../ui';


describe('CharactersAIR View', () => {
    it('renders with title', () => {
        const { getByText } = render(
            <View
                title="Test Characters"
                characters={[]}
                onSelect={() => { }}
            />
        );

        expect(getByText('Test Characters')).toBeInTheDocument();
    });

    it('renders characters', () => {
        const characters = [
            { id: '1', name: 'Char1', role: 'Role1' }
        ];

        const { getByText } = render(
            <View
                title="Test"
                characters={characters}
                onSelect={() => { }}
            />
        );

        expect(getByText('Char1')).toBeInTheDocument();
        expect(getByText('Role1')).toBeInTheDocument();
    });
});
