import React from 'react';
import MediaGrid from '../../components/MediaGrid';
import { fetchTrendingAnime, searchAnime } from '../../services/api';
import SearchBar from '../../components/SearchBar';
import { useMediaScreen } from '../../hooks/useMediaScreen';

export default function Animes() {
    const { data, isLoading, searchQuery, setSearchQuery, handleSearch, handleRefresh } = useMediaScreen(fetchTrendingAnime, searchAnime);

    return (
        <MediaGrid
            data={data}
            isLoading={isLoading}
            title="Animes"
            refreshing={isLoading}
            onRefresh={handleRefresh}
            ListHeaderComponent={
                <SearchBar
                    searchBarText="Buscar anime"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    onSubmit={handleSearch}
                />
            }
        />
    );
}
