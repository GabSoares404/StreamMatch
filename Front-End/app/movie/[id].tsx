import { useLocalSearchParams, Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Dimensions, ActivityIndicator } from 'react-native';
import { fetchGenericDetails, MediaDetail, fetchDetailsFromTmdb } from '../../services/api';
import { useColorScheme } from '../../hooks/use-color-scheme';
import { Colors } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function MovieDetails() {
    const { id, source } = useLocalSearchParams();
    const [movie, setMovie] = useState<MediaDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const theme = useColorScheme() ?? 'light';

    useEffect(() => {
        loadDetails();
    }, [id]);

    const loadDetails = async () => {
        setLoading(true);
        let data;

        const isTmdb = source === 'tmdb' || (Array.isArray(source) && source.includes('tmdb'));

        if (isTmdb) {
            // Direct fetch from TMDB, skipping unreliable Simkl ID resolution
            data = await fetchDetailsFromTmdb(Number(id), 'movie');
        } else {
            data = await fetchGenericDetails(Number(id), 'movie');
        }
        setMovie(data);
        setLoading(false);
    };

    if (loading) {
        return (
            <View style={[styles.center, { backgroundColor: Colors[theme].background }]}>
                <ActivityIndicator size="large" color={Colors[theme].tint} />
            </View>
        );
    }

    if (!movie) {
        return (
            <View style={[styles.center, { backgroundColor: Colors[theme].background }]}>
                <Text style={{ color: Colors[theme].text }}>Filme não encontrado.</Text>
            </View>
        );
    }

    const posterUrl = movie.poster
        ? (movie.poster.toString().startsWith('http') ? movie.poster : `https://simkl.in/posters/${movie.poster}_m.jpg`)
        : null;
    const fanartUrl = movie.fanart
        ? (movie.fanart.toString().startsWith('http') ? movie.fanart : `https://simkl.in/fanart/${movie.fanart}_medium.jpg`)
        : null;

    return (
        <ScrollView style={[styles.container, { backgroundColor: Colors[theme].background }]}>
            <Stack.Screen options={{ title: movie.title || 'Detalhes', headerBackTitle: 'Voltar' }} />

            <View style={{ width: width, height: 250, position: 'relative' }}>
                {fanartUrl && <Image source={{ uri: fanartUrl }} style={styles.fanart} />}
            </View>
            <View style={styles.posterContainer}>
                {posterUrl ? (
                    <Image source={{ uri: posterUrl }} style={styles.poster} />
                ) : (
                    <View style={[styles.poster, { backgroundColor: '#333', justifyContent: 'center', alignItems: 'center' }]}>
                        <Ionicons name="image-outline" size={40} color="#fff" />
                    </View>
                )}
            </View>

            <View style={styles.content}>
                <Text style={[styles.title, { color: Colors[theme].text }]}>{movie.title}</Text>
                <View style={styles.row}>
                    <Text style={[styles.text, { color: Colors[theme].icon }]}>{movie.year} • {movie.runtime ? `${movie.runtime} min` : 'N/A'} • {movie.country?.toUpperCase()}</Text>
                </View>

                <View style={[styles.stats, { backgroundColor: theme === 'dark' ? '#1E1E1E' : '#F0F0F0' }]}>
                    <View style={styles.statItem}>
                        <Text style={[styles.statLabel, { color: Colors[theme].icon }]}>Simkl</Text>
                        <Text style={[styles.statValue, { color: Colors[theme].text }]}>{movie.ratings?.simkl?.rating?.toFixed(1) || '-'}</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={[styles.statLabel, { color: Colors[theme].icon }]}>IMDb</Text>
                        <Text style={[styles.statValue, { color: Colors[theme].text }]}>{movie.ratings?.imdb?.rating?.toFixed(1) || '-'}</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={[styles.statLabel, { color: Colors[theme].icon }]}>TMDB</Text>
                        <Text style={[styles.statValue, { color: Colors[theme].text }]}>{movie.tmdbRating?.toFixed(1) || '-'}</Text>
                    </View>
                </View>

                {movie.overview && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Sinopse</Text>
                        <Text style={[styles.text, { color: Colors[theme].text, lineHeight: 24 }]}>{movie.overview}</Text>
                    </View>
                )}

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Status</Text>
                    <Text style={[styles.text, { color: Colors[theme].text }]}>{movie.status || 'N/A'}</Text>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    fanart: {
        width: width,
        height: 250,
        opacity: 0.6,
    },
    posterContainer: {
        position: 'absolute',
        top: 150,
        left: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 5,
        elevation: 5,
    },
    poster: {
        width: 100, // Small poster overlay
        height: 150,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#fff',
    },
    content: {
        marginTop: 60, // Space for poster overlap
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    row: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 20,
    },
    year: {},
    runtime: {},
    country: {},
    text: {
        fontSize: 16,
    },
    stats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 12,
        marginBottom: 20,
    },
    statItem: {
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 12,
        marginBottom: 4,
    },
    statValue: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    section: {
        marginBottom: 16,
    },
    sectionTitle: {
        color: '#E50914',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    }
});
