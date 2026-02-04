import React, { useEffect, useState } from 'react';
import MediaGrid from '../../components/MediaGrid';
import { searchMovies, fetchTrendingMovies, UnifiedMedia } from '../../services/api';

import SearchBar from '../../components/SearchBar';

export default function Movies() {
    const [movies, setMovies] = useState<UnifiedMedia[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        const data = await fetchTrendingMovies();
        setMovies(data);
        setIsLoading(false);
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            loadData();
            return;
        }
        setIsLoading(true);
        const results = await searchMovies(searchQuery);
        setMovies(results);
        setIsLoading(false);
    };

    const handleRefresh = async () => {
        setSearchQuery('');
        await loadData();
    };

    return (
        <MediaGrid
            data={movies}
            isLoading={isLoading}
            title="Filmes"
            refreshing={isLoading}
            onRefresh={handleRefresh}
            ListHeaderComponent={
                <SearchBar
                    searchBarText="Buscar filme"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    onSubmit={handleSearch}
                />
            }
        />
    );
}
