import { useState } from 'react';

export interface NoteTakerAIRProps {
    initialValue?: string;
    placeholder?: string;
}

export const useNoteTaker = ({ initialValue = '' }: NoteTakerAIRProps) => {
    const [value, setValue] = useState(initialValue);

    return {
        value,
        setValue
    };
};
