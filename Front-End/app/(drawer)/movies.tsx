import React from 'react';
import MediaGrid from '../../components/MediaGrid';
import { searchMovies, fetchTrendingMovies } from '../../services/api';
import SearchBar from '../../components/SearchBar';
import { useMediaScreen } from '../../hooks/useMediaScreen';

export default function Movies() {
    const { data, isLoading, searchQuery, setSearchQuery, handleSearch, handleRefresh } = useMediaScreen(fetchTrendingMovies, searchMovies);

    return (
        <MediaGrid
            data={data}
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
