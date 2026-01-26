import { useLocalSearchParams } from 'expo-router';
import { View, Text, StyleSheet, ScrollView, Image, Dimensions } from 'react-native';
import { useMovieStore } from '../../store/useMovieStore';
import { useColorScheme } from '../../hooks/use-color-scheme';
import { Colors } from '../../constants/theme';

const { width } = Dimensions.get('window');

export default function MovieDetails() {
    const { id } = useLocalSearchParams();
    const { getMovieById } = useMovieStore();
    const theme = useColorScheme() ?? 'light';

    const parsedMovie = getMovieById(Number(id));

    if (!parsedMovie) {
        return (
            <View style={[styles.container, { backgroundColor: Colors[theme].background }]}>
                <Text style={[styles.text, { color: Colors[theme].text }]}>Movie not found.</Text>
            </View>
        );
    }

    const posterUrl = `https://simkl.in/posters/${parsedMovie.poster}_m.jpg`;
    const fanartUrl = `https://simkl.in/fanart/${parsedMovie.fanart}_medium.jpg`;

    return (
        <ScrollView style={[styles.container, { backgroundColor: Colors[theme].background }]}>
            <Image source={{ uri: fanartUrl }} style={styles.fanart} />
            <View style={styles.posterContainer}>
                <Image source={{ uri: posterUrl }} style={styles.poster} />
            </View>

            <View style={styles.content}>
                <Text style={[styles.title, { color: Colors[theme].text }]}>{parsedMovie.title}</Text>
                <View style={styles.row}>
                    <Text style={[styles.year, { color: Colors[theme].icon }]}>{parsedMovie.year}</Text>
                    <Text style={[styles.runtime, { color: Colors[theme].icon }]}>{parsedMovie.runtime}</Text>
                    <Text style={[styles.country, { color: Colors[theme].icon }]}>{parsedMovie.country?.toUpperCase()}</Text>
                </View>

                <View style={[styles.stats, { backgroundColor: theme === 'dark' ? '#1E1E1E' : '#F0F0F0' }]}>
                    <View style={styles.statItem}>
                        <Text style={[styles.statLabel, { color: Colors[theme].icon }]}>Watchers</Text>
                        <Text style={[styles.statValue, { color: Colors[theme].text }]}>{parsedMovie.watched}</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={[styles.statLabel, { color: Colors[theme].icon }]}>Plan to Watch</Text>
                        <Text style={[styles.statValue, { color: Colors[theme].text }]}>{parsedMovie.plan_to_watch}</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={[styles.statLabel, { color: Colors[theme].icon }]}>Rating</Text>
                        <Text style={[styles.statValue, { color: Colors[theme].text }]}>{parsedMovie.rating?.toFixed(1)}</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Status</Text>
                    <Text style={[styles.text, { color: Colors[theme].text }]}>{parsedMovie.status}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Ratings</Text>
                    <Text style={[styles.text, { color: Colors[theme].text }]}>Simkl: {parsedMovie.ratings.simkl?.rating || '-'} ({parsedMovie.ratings.simkl?.votes || '-'} votes)</Text>
                    <Text style={[styles.text, { color: Colors[theme].text }]}>IMDb: {parsedMovie.ratings.imdb?.rating || '-'} ({parsedMovie.ratings.imdb?.votes || '-'} votes)</Text>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
