import React, { useState } from 'react';

export interface QueryAIRProps {
    initialQuery?: string;
    placeholder?: string;
    onSelect?: (item: any) => void;
    mockData?: any[];
}

export const useQuery = ({
    initialQuery = '',
    mockData = ['Item A', 'Item B', 'Item C']
}: QueryAIRProps) => {
    const [query, setQuery] = useState(initialQuery);
    const [isSearching, setIsSearching] = useState(false);
    const [results, setResults] = useState<any[]>([]);

    // Simulated search effect
    React.useEffect(() => {
        if (!query) {
            setResults([]);
            return;
        }

        setIsSearching(true);
        const timer = setTimeout(() => {
            const filtered = mockData.filter(item =>
                String(item).toLowerCase().includes(query.toLowerCase())
            );
            setResults(filtered);
            setIsSearching(false);
        }, 500);

        return () => clearTimeout(timer);
    }, [query, mockData]);

    return {
        query,
        setQuery,
        isSearching,
        results
    };
};
