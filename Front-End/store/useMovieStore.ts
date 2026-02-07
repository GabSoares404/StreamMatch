import { create } from 'zustand';
import { UnifiedMedia, fetchTrendingMovies, fetchTrendingTV, fetchTrendingAnime, fetchTrendingSeries } from '../services/api';

interface MediaState {
    movies: UnifiedMedia[];
    series: UnifiedMedia[];
    tv: UnifiedMedia[];
    anime: UnifiedMedia[];
    isLoading: boolean;
    lastFetched: number | null;
    fetchAllTrending: () => Promise<void>;
    getMediaById: (id: number, type: 'movie' | 'tv' | 'anime') => UnifiedMedia | undefined;
}

export const useMovieStore = create<MediaState>((set, get) => ({
    movies: [],
    series: [],
    tv: [],
    anime: [],
    isLoading: false,
    lastFetched: null,
    fetchAllTrending: async () => {
        // Simple cache validity check (e.g., 5 minutes) - skipping for now to ensure freshness on reload
        // if (get().lastFetched && Date.now() - get().lastFetched! < 300000) return;

        set({ isLoading: true });
        try {
            const [movies, series, tv, anime] = await Promise.all([
                fetchTrendingMovies(),
                fetchTrendingSeries(),
                fetchTrendingTV(),
                fetchTrendingAnime()
            ]);

            set({
                movies,
                series,
                tv,
                anime,
                isLoading: false,
                lastFetched: Date.now()
            });
        } catch (error) {
            console.error(error);
            set({ isLoading: false });
        }
    },
    getMediaById: (id: number, type: 'movie' | 'tv' | 'anime') => {
        const state = get();
        if (type === 'movie') return state.movies.find((m) => m.id === id);
        if (type === 'anime') return state.anime.find((m) => m.id === id);
        return state.tv.find((m) => m.id === id) || state.series.find((m) => m.id === id);
    }
}));
