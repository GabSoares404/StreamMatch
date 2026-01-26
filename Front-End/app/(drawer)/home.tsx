import React, { useEffect } from 'react';
import { View, FlatList, ActivityIndicator, StyleSheet, Text, useWindowDimensions } from 'react-native';
import { useMovieStore } from '../../store/useMovieStore';
import MovieCard from '../../components/MovieCard';
import { useRouter } from 'expo-router';

// Config
const CONTAINER_PADDING = 10;
const ITEM_MARGIN = 4;
const MIN_CARD_WIDTH = 160;

import { useColorScheme } from '../../hooks/use-color-scheme';
import { Colors } from '../../constants/theme';

export default function Home() {
    const theme = useColorScheme() ?? 'light';
    const { movies, isLoading, fetchMovies } = useMovieStore();
    const router = useRouter();
    const { width } = useWindowDimensions();

    // Calculate dynamic columns
    const availableWidth = width - (CONTAINER_PADDING * 2);
    // Rough estimate of how many columns fit
    const numColumns = Math.floor(availableWidth / (MIN_CARD_WIDTH + (ITEM_MARGIN * 2)));
    // Clamp to at least 2 columns
    const finalColumns = Math.max(2, numColumns);

    // Calculate exact card width to fill space
    // Card width = (Available Width - (Total Margins)) / Columns
    const cardWidth = (availableWidth - (ITEM_MARGIN * 2 * finalColumns)) / finalColumns;

    useEffect(() => {
        fetchMovies();
    }, []);

    if (isLoading) {
        return (
            <View style={[styles.center, { backgroundColor: Colors[theme].background }]}>
                <ActivityIndicator size="large" color={Colors[theme].tint} />
                <Text style={[styles.loadingText, { color: Colors[theme].text }]}>Fetching Trending Movies...</Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: Colors[theme].background }]}>
            <FlatList
                key={`grid-${finalColumns}`} // Force re-render when columns change
                data={movies}
                keyExtractor={(item) => item.ids.simkl?.toString() || Math.random().toString()}
                numColumns={finalColumns}
                renderItem={({ item }) => (
                    <MovieCard
                        movie={item}
                        width={cardWidth}
                        onPress={() => {
                            const movieId = item.ids.simkl || item.ids.simkl_id;
                            if (movieId) {
                                router.push({
                                    pathname: '/movie/[id]',
                                    params: { id: movieId }
                                });
                            }
                        }}
                    />
                )}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                columnWrapperStyle={styles.columnWrapper}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffffff',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#121212',
    },
    loadingText: {
        color: '#fff',
        marginTop: 12,
        fontSize: 16,
    },
    list: {
        paddingVertical: 20,
        paddingHorizontal: CONTAINER_PADDING,
    },
    columnWrapper: {
        justifyContent: 'flex-start', // Ensures even spacing
    }
});
