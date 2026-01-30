import React, { useEffect } from 'react';
import { useMovieStore } from '../../store/useMovieStore';
import MediaGrid from '../../components/MediaGrid';

export default function Home() {
    const { movies, isLoading, fetchMovies } = useMovieStore();

    useEffect(() => {
        fetchMovies();
    }, []);

    return <MediaGrid data={movies} isLoading={isLoading} title="Filmes em Alta" />;
}
