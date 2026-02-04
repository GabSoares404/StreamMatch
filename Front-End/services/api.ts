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

export const fetchTrendingMovies = async (): Promise<UnifiedMedia[]> => {
    try {
        const response = await fetch(`${API_BASE}/movies/trending/month?client_id=${CLIENT_ID}`);
        if (!response.ok) throw new Error(`Failed to fetch trending movies: ${response.statusText}`);
        const data = await response.json();
        return data.slice(0, 20).map((item: any) => ({
            id: item.ids.simkl || item.ids.simkl_id || Math.floor(Math.random() * 1000000),
            title: item.title,
            poster: item.poster,
            fanart: item.fanart,
            year: item.year,
            rating: item.ratings?.simkl?.rating || item.ratings?.imdb?.rating,
            type: 'movie'
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
    // Using TMDb for Anime search to ensure PT-BR title support (e.g. "Cavaleiros do Zodíaco")
    // We map the type to 'anime' so the app treats it correctly (Simkl resolution will happen later)
    if (!TMDB_API_KEY) return [];
    try {
        const response = await fetch(`${TMDB_BASE}/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=pt-BR`);
        if (!response.ok) throw new Error(`Failed to search anime: ${response.statusText}`);
        const data = await response.json();
        return data.results.map((item: any) => ({
            id: item.id,
            title: item.name,
            poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : '',
            fanart: item.backdrop_path ? `https://image.tmdb.org/t/p/w1280${item.backdrop_path}` : '',
            year: item.first_air_date ? item.first_air_date.substring(0, 4) : '',
            rating: item.vote_average,
            type: 'anime', // Force type anime
            source: 'tmdb'
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
            type: 'anime'
        }));
    } catch (error) {
        console.error("Fetch Trending Anime Error:", error);
        return [];
    }
};

export const fetchTrendingTV = async (): Promise<UnifiedMedia[]> => {
    try {
        const response = await fetch(`${API_BASE}/tv/trending/month?client_id=${CLIENT_ID}`);
        if (!response.ok) throw new Error(`Failed to fetch trending tv: ${response.statusText}`);
        const data = await response.json();
        return data.slice(0, 20).map((item: any) => ({
            id: item.ids.simkl || item.ids.simkl_id || Math.floor(Math.random() * 1000000),
            title: item.title,
            poster: item.poster,
            fanart: item.fanart,
            year: item.year,
            rating: item.ratings?.simkl?.rating || item.ratings?.imdb?.rating,
            type: 'tv'
        }));
    } catch (error) {
        console.error("Fetch Trending TV Error:", error);
        return [];
    }
};

export const fetchTrendingSeries = async (): Promise<UnifiedMedia[]> => {
    // Simkl uses 'tv' for series basically. We can filter or just use the same endpoint.
    // For specific "Series" vs "TV" distinction, Simkl separates by type maybe?
    // For now, mapping 'Series' tab to standard TV trending, same as TV tab implies.
    // User might want distinct content, but mostly they are synonyms in API context.
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
}

export interface WatchProvider {
    provider_id: number;
    provider_name: string;
    logo_path: string;
}

const TMDB_API_KEY = process.env.EXPO_PUBLIC_TMDB_API_KEY;
const TMDB_BASE = 'https://api.themoviedb.org/3';

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

export const fetchDetailsFromTmdb = async (tmdbId: number, type: 'movie' | 'tv' | 'anime'): Promise<MediaDetail | null> => {
    // Fallback: Construct MediaDetail purely from TMDb
    // Anime is treated as TV in TMDb usually
    const tmdbType = type === 'movie' ? 'movie' : 'tv';
    const tmdbData = await fetchTMDBDetails(tmdbId, tmdbType);

    if (!tmdbData) return null;

    const poster = tmdbData.poster_path ? `https://image.tmdb.org/t/p/w500${tmdbData.poster_path}` : '';
    const fanart = tmdbData.backdrop_path ? `https://image.tmdb.org/t/p/w1280${tmdbData.backdrop_path}` : '';

    return {
        id: tmdbData.id,
        title: tmdbData.title || tmdbData.name,
        poster: poster,
        fanart: fanart,
        year: tmdbData.release_date?.substring(0, 4) || tmdbData.first_air_date?.substring(0, 4),
        rating: tmdbData.vote_average,
        type: type,
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

export const getSimklIdFromTmdb = async (tmdbId: number): Promise<number | null> => {
    try {
        const response = await fetch(`${API_BASE}/search/id?tmdb=${tmdbId}&client_id=${CLIENT_ID}`);
        if (!response.ok) return null;
        const data = await response.json();
        if (data && data.length > 0 && data[0].ids && data[0].ids.simkl) {
            return data[0].ids.simkl;
        }
        return null;
    } catch (error) {
        console.error("Get Simkl ID Error:", error);
        return null;
    }
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

        // 2. Fetch TMDB Data (Localized) if ID exists
        let tmdbData = null;
        if (simklData.ids.tmdb) {
            // Anime is usually 'tv' in TMDB, but could be 'movie' depending on the item. 
            // Simkl type 'anime' maps to TMDB 'tv' mostly (exceptions exist for movies).
            // For safety, we trust the 'type' param unless it's anime, then we guess 'tv' first?
            // Simkl usually handles mapping. Let's assume 'anime' -> 'tv' for TMDB mostly.
            const tmdbType = type === 'movie' ? 'movie' : 'tv';
            tmdbData = await fetchTMDBDetails(simklData.ids.tmdb, tmdbType);
        }

        // 3. Merge Data (Prioritize TMDB for Text/Loc field)
        const country = tmdbData?.production_countries?.[0]?.iso_3166_1 || simklData.country;
        const overview = tmdbData?.overview || simklData.overview;
        // User requested Original Title (Romanized for Anime)
        let title = tmdbData?.original_title || tmdbData?.original_name || simklData.title;
        if (type === 'anime') {
            // For Anime, TMDB original_name is often Kanji. Simkl title is usually Romaji/English.
            title = simklData.title;
        }

        const poster = tmdbData?.poster_path ? `https://image.tmdb.org/t/p/w500${tmdbData.poster_path}` : simklData.poster;
        const fanart = tmdbData?.backdrop_path ? `https://image.tmdb.org/t/p/w1280${tmdbData.backdrop_path}` : simklData.fanart;

        // Extract BR Providers (Flatrate only)
        const providers = tmdbData?.['watch/providers']?.results?.BR?.flatrate?.map((p: any) => ({
            provider_id: p.provider_id,
            provider_name: p.provider_name,
            logo_path: `https://image.tmdb.org/t/p/w200${p.logo_path}`
        })) || [];

        // Note: Existing app expects 'poster' to be just the hash for Simkl.
        // We need to return a property that the UI can handle. 
        // The UI currently does: `https://simkl.in/posters/${media.poster}_m.jpg`
        // We should PROBABLY keep providing the Simkl poster hash to avoid breaking the UI, 
        // OR update the UI to handle full URLs.
        // Let's stick to returning Simkl images for now to avoid breaking the image component 
        // unless we update the UI component too.
        // BUT user specifically asked for "Country" and better data. 
        // Let's UPDATE the Country and text fields first.

        return {
            id: simklData.ids.simkl,
            title: title,
            poster: simklData.poster, // Keep Simkl poster hash for now to ensure compatibility
            fanart: simklData.fanart, // Keep Simkl fanart hash for now
            year: simklData.year,
            rating: simklData.ratings?.simkl?.rating,
            type: type,
            overview: overview,
            runtime: simklData.runtime, // Simkl runtime is often in generic format
            country: country, // This is now localized from TMDB!
            status: simklData.status,
            genres: simklData.genres,
            ratings: simklData.ratings,
            tmdbRating: tmdbData?.vote_average,
            providers: providers
        };
    } catch (error) {
        console.error(`Fetch Generic Details Error (${type}/${id}):`, error);
        return null;
    }
};


