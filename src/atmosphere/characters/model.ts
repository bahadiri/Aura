import { useState, useEffect } from 'react';

export interface Character {
    id: string | number;
    name: string;
    role: string;
    imageUrl?: string;
    description?: string;
    traits?: string[];
}

export interface UseCharactersProps {
    characters?: Character[];
    query?: string;
    title?: string;
    onSelect?: (char: Character) => void;
    updateWindow?: (data: any) => void;
}

export const useCharacters = ({
    characters: initialCharacters = [],
    query,
    title,
    onSelect,
    updateWindow
}: UseCharactersProps) => {
    const [characters, setCharacters] = useState<Character[]>(initialCharacters);
    const [isLoading, setIsLoading] = useState(!initialCharacters.length && !!query);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!initialCharacters.length && query) {
            setIsLoading(true);
            // Default to 8001 (Saga Backend) if undefined, consolidating ports
            const baseUrl = import.meta.env.VITE_SAGA_API_URL || `http://localhost:8001`;
            fetch(`${baseUrl}/api/search/characters?q=${encodeURIComponent(query)}`)
                .then(res => res.json())
                .then(data => {
                    if (data.characters && data.characters.length > 0) {
                        setCharacters(data.characters);
                        // PERSISTENCE: Save fetched characters to window state
                        if (updateWindow) {
                            console.log("[CharactersAIR] Persisting characters to window state");
                            updateWindow({ props: { characters: data.characters, query, title } });
                        }
                    } else if (data.error) {
                        setError(data.error);
                    } else {
                        setError('No characters found');
                    }
                })
                .catch(err => {
                    console.error("Character fetch failed:", err);
                    setError('Failed to load characters');
                })
                .finally(() => setIsLoading(false));
        } else if (initialCharacters.length > 0) {
            setCharacters(initialCharacters);
            setIsLoading(false);
        }
    }, [initialCharacters, query]);

    const handleSelect = (char: Character) => {
        if (onSelect) {
            onSelect(char);
        }
    };

    return {
        characters,
        isLoading,
        error,
        handleSelect,
        displayTitle: title || query || 'Characters'
    };
};
