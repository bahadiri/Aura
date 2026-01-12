import { useState } from 'react';

export interface InfoItem {
    id?: string | number;
    title: string;
    description: string;
    metadata?: any;
}

export interface UseInfoGridProps {
    items?: InfoItem[];
    collapsible?: boolean;
}

export const useInfoGrid = ({ items = [], collapsible = false }: UseInfoGridProps) => {
    const [expandedId, setExpandedId] = useState<string | number | null>(null);

    const toggle = (id: string | number) => {
        if (!collapsible) return;
        setExpandedId(expandedId === id ? null : id);
    };

    return {
        items,
        expandedId,
        toggle
    };
};
