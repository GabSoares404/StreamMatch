import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import MediaGrid from '../../components/MediaGrid';
import { fetchTrendingMovies, UnifiedMedia } from '../../services/api';

export default function Movies() {
    const [movies, setMovies] = useState<UnifiedMedia[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        const data = await fetchTrendingMovies();
        setMovies(data);
        setIsLoading(false);
    };

    return <MediaGrid data={movies} isLoading={isLoading} title="Filmes" />;
}
