import { useState, useEffect } from 'react';
import { UnifiedMedia } from '../services/api';

type FetchFunction = () => Promise<UnifiedMedia[]>;
type SearchFunction = (query: string) => Promise<UnifiedMedia[]>;

export function useMediaScreen(fetchDefault: FetchFunction, searchFn: SearchFunction) {
    const [data, setData] = useState<UnifiedMedia[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        const res = await fetchDefault();
        setData(res);
        setIsLoading(false);
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            loadData();
            return;
        }
        setIsLoading(true);
        const results = await searchFn(searchQuery);
        setData(results);
        setIsLoading(false);
    };

    const handleRefresh = async () => {
        setSearchQuery('');
        await loadData();
    };

    return {
        data,
        isLoading,
        searchQuery,
        setSearchQuery,
        handleSearch,
        handleRefresh
    };
}
