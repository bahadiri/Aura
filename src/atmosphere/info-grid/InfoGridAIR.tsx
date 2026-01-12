import React from 'react';
import { useInfoGrid, InfoItem } from './model';
import { View } from './view';

export type { InfoItem }; // Re-export for compatibility

export interface InfoGridAIRProps {
    items?: InfoItem[];
    title?: string;
    columns?: number;
    collapsible?: boolean;
    headerContent?: React.ReactNode;
    isLoading?: boolean;
    loadingText?: string;
}

export const InfoGridAIR: React.FC<InfoGridAIRProps> = ({
    items: initialItems = [],
    title,
    columns = 1,
    collapsible = false,
    headerContent,
    isLoading,
    loadingText = "Loading..."
}) => {
    const {
        items,
        expandedId,
        toggle
    } = useInfoGrid({ items: initialItems, collapsible });

    return (
        <View
            items={items}
            title={title}
            columns={columns}
            collapsible={collapsible}
            headerContent={headerContent}
            isLoading={isLoading}
            loadingText={loadingText}
            expandedId={expandedId}
            onToggle={toggle}
        />
    );
};
