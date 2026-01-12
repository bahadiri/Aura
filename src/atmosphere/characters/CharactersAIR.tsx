import React from 'react';
import { useCharacters, Character } from './model';
import { View } from './view';

export interface CharactersAIRProps {
    title?: string;
    characters?: Character[];
    onSelect?: (char: Character) => void;
}

export const CharactersAIR: React.FC<CharactersAIRProps> = ({
    title = "Characters",
    characters: initialCharacters,
    onSelect
}) => {
    const {
        characters,
        handleSelect
    } = useCharacters({ characters: initialCharacters, onSelect });

    return (
        <View
            title={title}
            characters={characters}
            onSelect={handleSelect}
        />
    );
};
