import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useMovieStore } from '../../store/useMovieStore';
import TrendingSlider from '../../components/TrendingSlider';
import { useColorScheme } from '../../hooks/use-color-scheme';
import { Colors } from '../../constants/theme';

export default function Home() {
    const { movies, series, tv, anime, isLoading, fetchAllTrending } = useMovieStore();
    const theme = useColorScheme() ?? 'light';

    useEffect(() => {
        fetchAllTrending();
    }, []);

    return (
        <ScrollView style={[styles.container, { backgroundColor: Colors[theme].background }]}>
            <View style={styles.contentContainer}>
                <TrendingSlider data={movies} title="Filmes em Alta" route="/(drawer)/movies" />
                <TrendingSlider data={series} title="Séries em Alta" route="/(drawer)/series" />
                <TrendingSlider data={tv} title="Em Alta na TV" route="/(drawer)/tv" />
                <TrendingSlider data={anime} title="Animes em Alta" route="/(drawer)/animes" />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    contentContainer: {
        paddingTop: 20,
        paddingBottom: 40,
    }
});
