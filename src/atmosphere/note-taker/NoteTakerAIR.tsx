import React from 'react';
import { useNoteTaker } from './model';
import { View } from './view';

export interface NoteTakerAIRProps {
    initialValue?: string;
    placeholder?: string;
}

export const NoteTakerAIR: React.FC<NoteTakerAIRProps> = ({
    initialValue = '',
    placeholder = "Take notes here..."
}) => {
    const { value, setValue } = useNoteTaker({ initialValue });

    return (
        <View
            value={value}
            setValue={setValue}
            placeholder={placeholder}
        />
    );
};
