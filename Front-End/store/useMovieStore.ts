import { create } from 'zustand';
import { MergedMovie, getMoviesWithDetails } from '../services/api';

interface MovieState {
    movies: MergedMovie[];
    isLoading: boolean;
    lastFetched: number | null;
    fetchMovies: () => Promise<void>;
    getMovieById: (id: number) => MergedMovie | undefined;
}

export const useMovieStore = create<MovieState>((set, get) => ({
    movies: [],
    isLoading: false,
    lastFetched: null,
    fetchMovies: async () => {
        // Simple cache validity check (e.g., 5 minutes) or just check if empty
        // User just said "cache", let's check if we have data first.
        if (get().movies.length > 0) return;

        set({ isLoading: true });
        try {
            const data = await getMoviesWithDetails();
            set({ movies: data, isLoading: false, lastFetched: Date.now() });
        } catch (error) {
            console.error(error);
            set({ isLoading: false });
        }
    },
    getMovieById: (id: number) => {
        return get().movies.find((m) => (m.ids.simkl === id || m.ids.simkl_id === id));
    }
}));
