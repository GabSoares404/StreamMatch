import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Dimensions, ScrollView, RefreshControl, useWindowDimensions, TouchableOpacity } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';
import { useColorScheme } from '../../hooks/use-color-scheme';
import { useAuthStore } from '../../store/useAuthStore';
import { UnifiedMedia, fetchGenericDetails, fetchListMediaDetails } from '../../services/api';
import MovieCard from '../../components/MovieCard';

const SPACING = 10;

export default function ListDetailsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const theme = useColorScheme() ?? 'light';
    const { user } = useAuthStore();
    const router = useRouter();
    const { width } = useWindowDimensions();

    const getColumns = () => {
        if (width >= 900) return 5;
        if (width >= 600) return 4;
        return 3;
    };

    const columns = getColumns();
    const itemWidth = (width - (SPACING * 2) - ((columns - 1) * SPACING)) / columns; // Accurate width calculation for flex wrap with gap

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [listName, setListName] = useState('');

    // Categorized items
    const [movies, setMovies] = useState<UnifiedMedia[]>([]);
    const [series, setSeries] = useState<UnifiedMedia[]>([]);
    const [tvShows, setTvShows] = useState<UnifiedMedia[]>([]);
    const [animes, setAnimes] = useState<UnifiedMedia[]>([]);

    const fetchListDetails = useCallback(async () => {
        if (!user || !user.id || !id) return;

        try {
            // 1. Fetch the list metadata
            const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.1.1.4:8000';
            const response = await fetch(`${API_URL}/watchlist/${user.id}`);
            if (!response.ok) throw new Error('Failed to fetch lists');

            const allLists = await response.json();
            const currentList = allLists.find((l: any) => l.id.toString() === id);

            if (!currentList) {
                // List not found or error
                setLoading(false);
                return;
            }

            setListName(currentList.nome_list);

            // 2. Fetch// Helper to fetch details
            const fetchItems = async (items: any[], type: string) => {
                const details = await Promise.all(items.map(async (id: number | string | any) => {
                    return await fetchListMediaDetails(id, type);
                }));
                return details.filter(item => item !== null) as UnifiedMedia[];
            };

            // Verify keys
            const [fetchedMovies, fetchedSeries, fetchedTV, fetchedAnimes] = await Promise.all([
                fetchItems(currentList.id_film || [], 'movie'),
                fetchItems(currentList.id_serie || [], 'series'),
                fetchItems(currentList.id_tv || [], 'tv'),
                fetchItems(currentList.id_anime || [], 'anime'),
            ]);

            setMovies(fetchedMovies);
            setSeries(fetchedSeries);
            setTvShows(fetchedTV);
            setAnimes(fetchedAnimes);

        } catch (error) {
            console.error("Error fetching list details:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user, id]);

    useEffect(() => {
        fetchListDetails();
    }, [fetchListDetails]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchListDetails();
    };

    const handleDelete = async () => {
        if (!id) return;

        try {
            const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.1.1.4:8000';
            const response = await fetch(`${API_URL}/watchlist/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                router.replace('/view-lists');
            } else {
                const errorText = await response.text();
                console.error(`Failed to delete list. Status: ${response.status}, Details: ${errorText}`);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const renderSection = (title: string, data: UnifiedMedia[]) => {
        if (data.length === 0) {
            return (
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: Colors[theme].text }]}>{title}</Text>
                    <Text style={{ color: Colors[theme].icon, fontStyle: 'italic', marginLeft: 4 }}>
                        Nenhum(a) {title.toLowerCase().slice(0, -1)} nesta lista.
                    </Text>
                </View>
            );
        }

        return (
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: Colors[theme].text }]}>{title}</Text>
                <View style={styles.grid}>
                    {data.map(item => (
                        <MovieCard
                            key={`${item.type}-${item.id}`}
                            movie={item}
                            width={itemWidth}
                            style={{ marginHorizontal: 0, marginBottom: 0 }}
                            onPress={() => {
                                if (item.type === 'movie') {
                                    router.push({
                                        pathname: '/movie/[id]',
                                        params: { id: item.id, source: item.source || 'simkl', type: item.type }
                                    });
                                } else {
                                    router.push({
                                        pathname: '/media/[id]',
                                        params: { id: item.id, source: item.source || 'simkl', type: item.type }
                                    });
                                }
                            }}
                        />
                    ))}
                </View>
            </View>
        );
    };

    if (loading && !refreshing) {
        return (
            <View style={[styles.container, styles.centered, { backgroundColor: Colors[theme].background }]}>
                <ActivityIndicator size="large" color={Colors[theme].tint} />
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: Colors[theme].background }}>
            <Stack.Screen options={{
                title: listName || 'Detalhes da Lista',
                headerBackTitle: 'Voltar',
                headerRight: () => (
                    <Text onPress={handleDelete} style={{ color: 'red', fontWeight: 'bold', marginRight: 10 }}>Excluir</Text>
                )
            }} />

            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.content}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors[theme].tint} />}
            >
                {renderSection('Filmes', movies)}
                {renderSection('Séries', series)}
                {renderSection('TV Shows', tvShows)}
                {renderSection('Animes', animes)}
            </ScrollView>

            <TouchableOpacity
                style={[styles.fab, { backgroundColor: Colors[theme].tint }]}
                onPress={() => router.push(`/add-to-list?listId=${id}`)}
            >
                <Ionicons name="add" size={32} color={Colors[theme].background} />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        padding: SPACING,
        paddingBottom: 100, // Space for FAB
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 12,
        marginLeft: 4,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING,
    },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 20,
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    }
});
