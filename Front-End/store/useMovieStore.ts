import { create } from 'zustand';
import { UnifiedMedia, fetchTrendingMovies } from '../services/api';

interface MovieState {
    movies: UnifiedMedia[];
    isLoading: boolean;
    lastFetched: number | null;
    fetchMovies: () => Promise<void>;
    getMovieById: (id: number) => UnifiedMedia | undefined;
}

export const useMovieStore = create<MovieState>((set, get) => ({
    movies: [],
    isLoading: false,
    lastFetched: null,
    fetchMovies: async () => {
        // Simple cache validity check (e.g., 5 minutes) or just check if empty
        if (get().movies.length > 0) return;

        set({ isLoading: true });
        try {
            const data = await fetchTrendingMovies();
            set({ movies: data, isLoading: false, lastFetched: Date.now() });
        } catch (error) {
            console.error(error);
            set({ isLoading: false });
        }
    },
    getMovieById: (id: number) => {
        return get().movies.find((m) => m.id === id);
    }
}));
