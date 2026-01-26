import Constants from 'expo-constants';

const API_BASE = 'https://api.simkl.com';
const CLIENT_ID = process.env.EXPO_PUBLIC_CLIENT_ID;

if (!CLIENT_ID) {
    console.warn('WARN: CLIENT_ID is missing from environment variables.');
}

export interface SimklIds {
    simkl_id?: number;
    simkl?: number;
    slug?: string;
    imdb?: string;
}

export interface SimklRating {
    rating: number;
    votes: number;
}

export interface SimklRatings {
    simkl?: SimklRating;
    imdb?: SimklRating;
}

export interface TrendingMovie {
    poster: string;
    fanart: string;
    ids: SimklIds;
    release_date: string;
    rank: number;
    drop_rate: string;
    watched: number;
    plan_to_watch: number;
    ratings: SimklRatings;
    country: string;
    runtime: string;
    status: string;
    dvd_date?: string;
}

export interface MovieDetail {
    title: string;
    year: number;
    type: string;
    ids: SimklIds;
}

export interface MergedMovie extends TrendingMovie {
    title: string;
    year?: number;
    rating: number; // The logic: rating with most votes
}

export const fetchTrendingMovies = async (): Promise<TrendingMovie[]> => {
    try {
        const response = await fetch(`${API_BASE}/movies/trending/month?client_id=${CLIENT_ID}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch trending movies: ${response.statusText}`);
        }
        const data = await response.json();
        return data; // Request returns an array of movies
    } catch (error) {
        console.error("Fetch Trending Error:", error);
        return [];
    }
};

export const fetchMovieDetails = async (simklId: number): Promise<MovieDetail | null> => {
    try {
        const response = await fetch(`${API_BASE}/movies/${simklId}?client_id=${CLIENT_ID}`);
        if (!response.ok) {
            // Some movies might not have details or id might be wrong, handle gracefully
            console.warn(`Failed to fetch details for ${simklId}: ${response.statusText}`);
            return null;
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Fetch Details Error (${simklId}):`, error);
        return null;
    }
};

export const getMoviesWithDetails = async (): Promise<MergedMovie[]> => {
    const trending = await fetchTrendingMovies();
    if (!trending || trending.length === 0) return [];

    // Limit to first 20 for performance during dev, or fetch all?
    // User didn't specify limit, but fetching 50+ details individually might be slow.
    // I'll do specific batch sizes or just map all. 
    // Optimization: Promise.all

    // Let's take the first 10 for now to ensure speed, or all if user wants list.
    // I'll fetch for the first 15 items to start.
    const subset = trending.slice(0, 15);

    const mergedPromises = subset.map(async (movie) => {
        const simklId = movie.ids.simkl || movie.ids.simkl_id;

        // Calculate best rating based on votes
        const simklVotes = movie.ratings.simkl?.votes || 0;
        const imdbVotes = movie.ratings.imdb?.votes || 0;
        const bestRating = simklVotes > imdbVotes
            ? (movie.ratings.simkl?.rating || 0)
            : (movie.ratings.imdb?.rating || 0);

        if (!simklId) {
            return {
                ...movie,
                title: 'Unknown Title',
                rating: bestRating
            };
        }

        const details = await fetchMovieDetails(simklId);
        return {
            ...movie,
            title: details?.title || 'Unknown Title',
            year: details?.year,
            rating: bestRating
        };
    });

    const results = await Promise.all(mergedPromises);
    return results;
};
