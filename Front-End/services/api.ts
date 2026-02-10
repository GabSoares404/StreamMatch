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

export interface UnifiedMedia {
    id: number;
    title: string;
    poster: string;
    fanart: string;
    year?: string;
    rating?: number;
    type: 'movie' | 'anime' | 'tv';
    source?: 'simkl' | 'tmdb';
}

const TMDB_API_KEY = process.env.EXPO_PUBLIC_TMDB_API_KEY;
const TMDB_BASE = 'https://api.themoviedb.org/3';

export const fetchTrendingMovies = async (): Promise<UnifiedMedia[]> => {
    if (!TMDB_API_KEY) return [];
    try {
        const response = await fetch(`${TMDB_BASE}/trending/movie/week?api_key=${TMDB_API_KEY}&language=pt-BR`);
        if (!response.ok) throw new Error(`Failed to fetch trending movies: ${response.statusText}`);
        const data = await response.json();
        return data.results.map((item: any) => ({
            id: item.id,
            title: item.title,
            poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : '',
            fanart: item.backdrop_path ? `https://image.tmdb.org/t/p/w1280${item.backdrop_path}` : '',
            year: item.release_date ? item.release_date.substring(0, 4) : '',
            rating: item.vote_average,
            type: 'movie',
            source: 'tmdb'
        }));
    } catch (error) {
        console.error("Fetch Trending Movies Error:", error);
        return [];
    }
};

export const searchMovies = async (query: string): Promise<UnifiedMedia[]> => {
    if (!TMDB_API_KEY) return [];
    try {
        const response = await fetch(`${TMDB_BASE}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=pt-BR`);
        if (!response.ok) throw new Error(`Failed to search movies: ${response.statusText}`);
        const data = await response.json();
        return data.results.map((item: any) => ({
            id: item.id,
            title: item.title,
            poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : '',
            fanart: item.backdrop_path ? `https://image.tmdb.org/t/p/w1280${item.backdrop_path}` : '',
            year: item.release_date ? item.release_date.substring(0, 4) : '',
            rating: item.vote_average,
            type: 'movie',
            source: 'tmdb'
        }));
    } catch (error) {
        console.error("Search Movies Error:", error);
        return [];
    }
};

export const searchTV = async (query: string): Promise<UnifiedMedia[]> => {
    if (!TMDB_API_KEY) return [];
    try {
        const response = await fetch(`${TMDB_BASE}/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=pt-BR`);
        if (!response.ok) throw new Error(`Failed to search tv: ${response.statusText}`);
        const data = await response.json();
        return data.results.map((item: any) => ({
            id: item.id,
            title: item.name,
            poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : '',
            fanart: item.backdrop_path ? `https://image.tmdb.org/t/p/w1280${item.backdrop_path}` : '',
            year: item.first_air_date ? item.first_air_date.substring(0, 4) : '',
            rating: item.vote_average,
            type: 'tv',
            source: 'tmdb'
        }));
    } catch (error) {
        console.error("Search TV Error:", error);
        return [];
    }
};

export const searchAnime = async (query: string): Promise<UnifiedMedia[]> => {
    try {
        const response = await fetch(`${API_BASE}/search/anime?q=${encodeURIComponent(query)}&client_id=${CLIENT_ID}`);
        if (!response.ok) throw new Error(`Failed to search anime: ${response.statusText}`);
        const data = await response.json();
        return data.filter((item: any) => item.ids && (item.ids.simkl || item.ids.simkl_id)).map((item: any) => ({
            id: item.ids.simkl || item.ids.simkl_id,
            title: item.title,
            poster: item.poster,
            fanart: item.fanart,
            year: item.year,
            rating: item.ratings?.simkl?.rating || item.ratings?.mal?.rating,
            type: 'anime',
            source: 'simkl'
        }));
    } catch (error) {
        console.error("Search Anime Error:", error);
        return [];
    }
};

export const fetchTrendingAnime = async (): Promise<UnifiedMedia[]> => {
    try {
        const response = await fetch(`${API_BASE}/anime/trending/month?client_id=${CLIENT_ID}`);
        if (!response.ok) throw new Error(`Failed to fetch trending anime: ${response.statusText}`);
        const data = await response.json();
        return data.slice(0, 20).map((item: any) => ({
            id: item.ids.simkl || item.ids.simkl_id || Math.floor(Math.random() * 1000000),
            title: item.title,
            poster: item.poster,
            fanart: item.fanart,
            year: item.year,
            rating: item.ratings?.simkl?.rating || item.ratings?.mal?.rating,
            type: 'anime',
            source: 'simkl'
        }));
    } catch (error) {
        console.error("Fetch Trending Anime Error:", error);
        return [];
    }
};

export const fetchTrendingTV = async (): Promise<UnifiedMedia[]> => {
    if (!TMDB_API_KEY) return [];
    try {
        const response = await fetch(`${TMDB_BASE}/trending/tv/week?api_key=${TMDB_API_KEY}&language=pt-BR`);
        if (!response.ok) throw new Error(`Failed to fetch trending tv: ${response.statusText}`);
        const data = await response.json();
        return data.results.map((item: any) => ({
            id: item.id,
            title: item.name,
            poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : '',
            fanart: item.backdrop_path ? `https://image.tmdb.org/t/p/w1280${item.backdrop_path}` : '',
            year: item.first_air_date ? item.first_air_date.substring(0, 4) : '',
            rating: item.vote_average,
            type: 'tv',
            source: 'tmdb'
        }));
    } catch (error) {
        console.error("Fetch Trending TV Error:", error);
        return [];
    }
};

export const fetchTrendingSeries = async (): Promise<UnifiedMedia[]> => {
    // TMDB doesn't separate generic Series vs TV essentially, so we reuse the TV endpoint
    return fetchTrendingTV();
};

export const fetchMovieDetails = async (simklId: number): Promise<MovieDetail | null> => {
    try {
        const response = await fetch(`${API_BASE}/movies/${simklId}?client_id=${CLIENT_ID}`);
        if (!response.ok) {
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

export interface MediaDetail extends UnifiedMedia {
    overview?: string;
    runtime?: string;
    country?: string;
    status?: string;
    genres?: string[];
    ratings?: SimklRatings;
    year?: string;
    tmdbRating?: number;
    providers?: WatchProvider[];
    ids?: any;
}

export interface WatchProvider {
    provider_id: number;
    provider_name: string;
    logo_path: string;
}



export const fetchTMDBDetails = async (tmdbId: number, type: 'movie' | 'tv') => {
    if (!TMDB_API_KEY) return null;
    try {
        const response = await fetch(`${TMDB_BASE}/${type}/${tmdbId}?api_key=${TMDB_API_KEY}&language=pt-BR&append_to_response=watch/providers`);
        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        console.error("TMDB Fetch Error:", error);
        return null;
    }
};

export const fetchDetailsFromTmdb = async (tmdbId: number, type: 'movie' | 'tv', originalType?: 'movie' | 'tv' | 'anime'): Promise<MediaDetail | null> => {
    // Fallback: Construct MediaDetail purely from TMDb
    // Anime is treated as TV in TMDb usually
    const tmdbType = type === 'movie' ? 'movie' : 'tv';
    const tmdbData = await fetchTMDBDetails(tmdbId, tmdbType);

    if (!tmdbData) return null;

    const poster = tmdbData.poster_path ? `https://image.tmdb.org/t/p/w500${tmdbData.poster_path}` : '';
    const fanart = tmdbData.backdrop_path ? `https://image.tmdb.org/t/p/w1280${tmdbData.backdrop_path}` : '';

    return {
        id: tmdbData.id,
        ids: { tmdb: tmdbData.id }, // Provide minimal IDs structure
        title: tmdbData.title || tmdbData.name,
        poster: poster,
        fanart: fanart,
        year: tmdbData.release_date?.substring(0, 4) || tmdbData.first_air_date?.substring(0, 4),
        rating: tmdbData.vote_average,
        type: originalType || type, // Use original type if provided (e.g. 'series' mapped to 'tv')
        source: 'tmdb', // Explicitly mark as TMDB source
        overview: tmdbData.overview,
        runtime: tmdbData.runtime ? `${tmdbData.runtime}` : undefined,
        country: tmdbData.production_countries?.[0]?.iso_3166_1,
        status: tmdbData.status,
        genres: tmdbData.genres?.map((g: any) => g.name),
        ratings: { imdb: { rating: tmdbData.vote_average, votes: tmdbData.vote_count } }, // Proxy TMDb as IMDb/Simkl rating for display
        tmdbRating: tmdbData.vote_average,
        providers: tmdbData['watch/providers']?.results?.BR?.flatrate?.map((p: any) => ({
            provider_id: p.provider_id,
            provider_name: p.provider_name,
            logo_path: `https://image.tmdb.org/t/p/w200${p.logo_path}`
        })) || []
    };
};


export const fetchGenericDetails = async (id: number, type: 'movie' | 'anime' | 'tv'): Promise<MediaDetail | null> => {
    try {
        let endpoint = `${type}s`;
        if (type === 'anime') endpoint = 'anime';
        if (type === 'tv') endpoint = 'tv';

        // 1. Fetch Simkl Data (Generic)
        const response = await fetch(`${API_BASE}/${endpoint}/${id}?client_id=${CLIENT_ID}&extended=full`);
        if (!response.ok) {
            console.warn(`Failed to fetch details for ${type}/${id}: ${response.statusText}`);
            return null;
        }
        const simklData = await response.json();

        if (!simklData || !simklData.ids) {
            console.warn(`Simkl data missing IDs for ${type}/${id}`);
            return null;
        }

        // 2. Fetch TMDB Data (Localized) if ID exists
        let tmdbData = null;
        if (simklData.ids.tmdb) {
            const tmdbType = type === 'movie' ? 'movie' : 'tv';
            tmdbData = await fetchTMDBDetails(simklData.ids.tmdb, tmdbType);
        }

        // 3. Merge Data (Prioritize TMDB for Text/Loc field)
        const country = tmdbData?.production_countries?.[0]?.iso_3166_1 || simklData.country;
        const overview = tmdbData?.overview || simklData.overview;
        let title = tmdbData?.original_title || tmdbData?.original_name || simklData.title;
        if (type === 'anime') {
            title = simklData.title;
        }

        const poster = tmdbData?.poster_path ? `https://image.tmdb.org/t/p/w500${tmdbData.poster_path}` : simklData.poster;
        const fanart = tmdbData?.backdrop_path ? `https://image.tmdb.org/t/p/w1280${tmdbData.backdrop_path}` : simklData.fanart;

        const providers = tmdbData?.['watch/providers']?.results?.BR?.flatrate?.map((p: any) => ({
            provider_id: p.provider_id,
            provider_name: p.provider_name,
            logo_path: `https://image.tmdb.org/t/p/w200${p.logo_path}`
        })) || [];

        return {
            id: simklData.ids.simkl,
            title: title,
            poster: poster,
            fanart: simklData.fanart,
            year: simklData.year,
            rating: simklData.ratings?.simkl?.rating,
            type: type,
            overview: overview,
            runtime: simklData.runtime,
            country: country,
            status: simklData.status,
            genres: simklData.genres,
            ratings: simklData.ratings,
            ids: simklData.ids,
            tmdbRating: tmdbData?.vote_average,
            providers: providers,
            source: 'simkl'
        };
    } catch (error) {
        console.error(`Fetch Generic Details Error (${type}/${id}):`, error);
        return null;
    }
};



export const fetchListMediaDetails = async (id: number | string, type: string): Promise<MediaDetail | null> => {
    try {
        if (type === 'anime') {
            // Anime uses Simkl IDs
            return await fetchGenericDetails(Number(id), 'anime');
        } else {
            // Movies, TV, Series use TMDB IDs
            // Ensure type is 'movie' or 'tv' for TMDB
            let tmdbType: 'movie' | 'tv' = 'movie';
            if (type === 'tv' || type === 'series') tmdbType = 'tv';

            return await fetchDetailsFromTmdb(Number(id), tmdbType, type as any);
        }
    } catch (error) {
        console.error(`Error fetching list media details for ${type}/${id}:`, error);
        return null;
    }
};
