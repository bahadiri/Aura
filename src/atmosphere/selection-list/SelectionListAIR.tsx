import React from 'react';
import { useSelectionList, SelectionListAIRProps } from './model';
import { View } from './view';

export type { SelectionListAIRProps };

export const SelectionListAIR = <T,>(props: SelectionListAIRProps<T>) => {
    const model = useSelectionList(props);

    return (
        <View {...model} />
    );
};
