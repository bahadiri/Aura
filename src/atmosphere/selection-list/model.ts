import type { ReactNode } from 'react';

export interface SelectionListAIRProps<T> {
    items?: T[];
    selectedIds?: string[] | number[];
    onToggle?: (id: string | number) => void;
    renderItem?: (item: T, isSelected: boolean) => ReactNode;
    keyExtractor?: (item: T) => string | number;
    title?: string;
    emptyText?: string;
}

export const useSelectionList = <T,>({
    items = [],
    selectedIds = [],
    onToggle = () => { },
    renderItem,
    keyExtractor = (item: T) => String(item),
    title,
    emptyText = "No items found."
}: SelectionListAIRProps<T>) => {
    return {
        items,
        selectedIds,
        onToggle,
        renderItem,
        keyExtractor,
        title,
        emptyText
    };
};
