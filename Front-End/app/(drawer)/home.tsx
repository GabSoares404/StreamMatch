import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useMovieStore } from '../../store/useMovieStore';
import TrendingSlider from '../../components/TrendingSlider';
import { useColorScheme } from '../../hooks/use-color-scheme';
import { Colors } from '../../constants/theme';

export default function Home() {
    const { movies, series, tv, anime, isLoading, fetchAllTrending } = useMovieStore();
    const theme = useColorScheme() ?? 'light';

    const router = useRouter();

    useEffect(() => {
        fetchAllTrending();
    }, []);

    return (
        <ScrollView style={[styles.container, { backgroundColor: Colors[theme].background }]}>
            <View style={styles.contentContainer}>
                <View style={[styles.createListContainer, { borderColor: Colors[theme].icon }]}>
                    <View style={styles.actionButtonContainer}>
                        <TouchableOpacity
                            style={[styles.createListButton, { backgroundColor: Colors[theme].tint }]}
                            onPress={() => router.push('/create-list')}
                        >
                            <Ionicons name="add" size={32} color={Colors[theme].background} />
                        </TouchableOpacity>
                        <Text style={[styles.buttonText, { color: Colors[theme].text }]}>Criar Lista</Text>
                    </View>

                    <View style={styles.actionButtonContainer}>
                        <TouchableOpacity
                            style={[styles.createListButton, { backgroundColor: Colors[theme].tint }]}
                            onPress={() => router.push('/view-lists')}
                        >
                            <Ionicons name="list" size={32} color={Colors[theme].background} />
                        </TouchableOpacity>
                        <Text style={[styles.buttonText, { color: Colors[theme].text }]}>Ver Listas</Text>
                    </View>
                </View>

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
    },
    createListContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 16,
        padding: 16,
        alignSelf: 'center',
        width: '90%',
    },
    actionButtonContainer: {
        alignItems: 'center',
    },
    createListButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    buttonText: {
        fontSize: 14,
        fontWeight: 'bold',
    }
});
