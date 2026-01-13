import React from 'react';
import { usePlotAIR, UsePlotAIRProps } from './model';
import { View } from './view';

export const PlotAIR: React.FC<UsePlotAIRProps> = (props) => {
    // Logic & State (Model)
    const model = usePlotAIR(props);

    // Render (View)
    return (
        <View {...model} onExpandSummary={model.expandSummary} />
    );
};
