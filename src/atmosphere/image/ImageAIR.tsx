import React from 'react';
import { useImageAIR, ImageAIRProps } from './model';
import { View } from './view';

export const ImageAIR: React.FC<ImageAIRProps> = (props) => {
    const model = useImageAIR(props);
    return <View {...model} />;
};
