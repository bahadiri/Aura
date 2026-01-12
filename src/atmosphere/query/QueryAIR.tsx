import React from 'react';
import { useQuery } from './model';
import { View } from './view';

export interface QueryAIRProps {
    initialQuery?: string;
    placeholder?: string;
    onSelect?: (item: any) => void;
    mockData?: any[];
}

export const QueryAIR: React.FC<QueryAIRProps> = ({
    initialQuery = '',
    placeholder = "Search...",
    onSelect,
    mockData = ['Item A', 'Item B', 'Item C']
}) => {
    const {
        query,
        setQuery,
        isSearching,
        results
    } = useQuery({ initialQuery, mockData });

    return (
        <View
            query={query}
            setQuery={setQuery}
            isSearching={isSearching}
            results={results}
            placeholder={placeholder}
            onSelect={onSelect}
        />
    );
};
