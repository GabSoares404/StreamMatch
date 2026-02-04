import React from 'react';
import MediaGrid from '../../components/MediaGrid';
import { fetchTrendingTV, searchTV } from '../../services/api';
import SearchBar from '../../components/SearchBar';
import { useMediaScreen } from '../../hooks/useMediaScreen';

export default function TV() {
    const { data, isLoading, searchQuery, setSearchQuery, handleSearch, handleRefresh } = useMediaScreen(fetchTrendingTV, searchTV);

    return (
        <MediaGrid
            data={data}
            isLoading={isLoading}
            title="TV"
            refreshing={isLoading}
            onRefresh={handleRefresh}
            ListHeaderComponent={
                <SearchBar
                    searchBarText="Buscar em TV"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    onSubmit={handleSearch}
                />
            }
        />
    );
}
