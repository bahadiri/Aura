import React from 'react';
import { useCharacters, Character } from './model';
import { View } from './view';

export interface CharactersAIRProps {
    title?: string;
    query?: string;
    characters?: Character[];
    onSelect?: (char: Character) => void;
    updateWindow?: (data: any) => void;
}

export const CharactersAIR: React.FC<CharactersAIRProps> = ({
    title,
    query,
    characters: initialCharacters,
    onSelect,
    updateWindow
}) => {
    const {
        characters,
        isLoading,
        error,
        handleSelect,
        displayTitle
    } = useCharacters({ characters: initialCharacters, query, title, onSelect, updateWindow });

    return (
        <View
            title={displayTitle}
            characters={characters}
            isLoading={isLoading}
            error={error}
            onSelect={handleSelect}
        />
    );
};
