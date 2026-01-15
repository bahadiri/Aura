import React from 'react';
import { useNoteTaker } from './model';
import { View } from './view';

export interface NoteTakerAIRProps {
    initialValue?: string;
    placeholder?: string;
    updateWindow?: (data: any) => void;
    title?: string;
}

export const NoteTakerAIR: React.FC<NoteTakerAIRProps> = ({
    initialValue = '',
    placeholder = "Take notes here...",
    updateWindow,
    title: initialTitle
}) => {
    const {
        value,
        setValue,
        title,
        isPolishing,
        isGeneratingTitle,
        polishNotes,
        downloadNotes
    } = useNoteTaker({ initialValue, updateWindow, title: initialTitle });

    return (
        <View
            value={value}
            setValue={setValue}
            placeholder={placeholder}
            title={title}
            isPolishing={isPolishing}
            isGeneratingTitle={isGeneratingTitle}
            onPolish={polishNotes}
            onDownload={downloadNotes}
        />
    );
};
