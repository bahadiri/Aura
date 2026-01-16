import { CharactersManifest } from './manifest';
import { resources } from './resources';
import CharactersUI from './ui'; // Default export from UI
import { useCharactersLogic } from './logic';
import React from 'react';

// The Module Component (Controller Entry Point)
const CharactersAIR: React.FC<any> = (props) => {
    // Logic Hook
    const { characters, isLoading, error, title } = useCharactersLogic(props);

    // Render UI
    return (
        <CharactersUI 
            title= { title }
    characters = { characters }
    isLoading = { isLoading }
    error = { error }
    onSelect = {(char) => console.log("Selected:", char.name)}
updateWindow = { props.updateWindow } // Pass down if UI needs it (optional)
    />
    );
};

export default {
    manifest: CharactersManifest,
    resources,
    component: CharactersAIR
};

// Also export named component for cleaner imports if needed
export { CharactersAIR as Component };
