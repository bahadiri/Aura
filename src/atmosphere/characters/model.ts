export interface Character {
    id: string;
    name: string;
    role: string;
    imageUrl?: string;
    description?: string;
}

export interface UseCharactersProps {
    characters?: Character[];
    onSelect?: (char: Character) => void;
}

export const useCharacters = ({
    characters = [],
    onSelect
}: UseCharactersProps) => {

    const handleSelect = (char: Character) => {
        if (onSelect) {
            onSelect(char);
        }
    };

    return {
        characters,
        handleSelect
    };
};
