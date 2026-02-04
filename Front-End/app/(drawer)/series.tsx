import React from 'react';
import MediaGrid from '../../components/MediaGrid';
import { fetchTrendingSeries, searchTV } from '../../services/api';
import SearchBar from '../../components/SearchBar';
import { useMediaScreen } from '../../hooks/useMediaScreen';

export default function Series() {
    const { data, isLoading, searchQuery, setSearchQuery, handleSearch, handleRefresh } = useMediaScreen(fetchTrendingSeries, searchTV);

    return (
        <MediaGrid
            data={data}
            isLoading={isLoading}
            title="Séries"
            refreshing={isLoading}
            onRefresh={handleRefresh}
            ListHeaderComponent={
                <SearchBar
                    searchBarText="Buscar série"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    onSubmit={handleSearch}
                />
            }
        />
    );
}
