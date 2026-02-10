import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Colors } from '../constants/theme';
import { useColorScheme } from '../hooks/use-color-scheme';
import { useAuthStore } from '../store/useAuthStore';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';

interface FormattedList {
    id: string;
    name: string;
    moviesCount: number;
    seriesCount: number;
    tvCount: number;
    animeCount: number;
}

export default function ViewListsScreen() {
    const theme = useColorScheme() ?? 'light';
    const router = useRouter();
    const { user } = useAuthStore();
    const [lists, setLists] = useState<FormattedList[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchLists = async () => {
        if (!user || !user.id) {
            setLoading(false);
            setRefreshing(false);
            return;
        }
        try {
            const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.1.1.4:8000';
            const response = await fetch(`${API_URL}/watchlist/${user.id}`);
            if (response.ok) {
                const data = await response.json();

                const formattedLists: FormattedList[] = data.map((item: any) => ({
                    id: item.id.toString(),
                    name: item.nome_list,
                    moviesCount: item.id_film?.length || 0,
                    seriesCount: item.id_serie?.length || 0,
                    tvCount: item.id_tv?.length || 0,
                    animeCount: item.id_anime?.length || 0,
                }));
                // Sort by most recent (assuming higher ID is newer, or just keep DB order)
                // For now, reverse to show newest first if DB returns insertion order
                setLists(formattedLists.reverse());
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };



    useFocusEffect(
        useCallback(() => {
            fetchLists();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchLists();
    };

    const renderListCard = ({ item }: { item: FormattedList }) => (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: '#1A1A1A' }]}
            onPress={() => router.push({ pathname: '/list-details/[id]', params: { id: item.id } })}
        >
            <View style={styles.cardHeader}>
                <Text style={[styles.listName, { color: Colors[theme].text }]}>{item.name}</Text>
                <Ionicons name="chevron-forward" size={20} color={Colors[theme].icon} />
            </View>

            <View style={styles.countsContainer}>
                <View style={styles.countBadge}>
                    <Text style={styles.countLabel}>Filmes</Text>
                    <Text style={[styles.countValue, { color: Colors[theme].tint }]}>{item.moviesCount}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.countBadge}>
                    <Text style={styles.countLabel}>Séries</Text>
                    <Text style={[styles.countValue, { color: Colors[theme].tint }]}>{item.seriesCount}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.countBadge}>
                    <Text style={styles.countLabel}>TV</Text>
                    <Text style={[styles.countValue, { color: Colors[theme].tint }]}>{item.tvCount}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.countBadge}>
                    <Text style={styles.countLabel}>Animes</Text>
                    <Text style={[styles.countValue, { color: Colors[theme].tint }]}>{item.animeCount}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: Colors[theme].background }]}>
            <Stack.Screen options={{ title: 'Minhas Listas', headerBackTitle: 'Voltar' }} />

            {loading && !refreshing ? (
                <View style={styles.centered}>
                    <Text style={{ color: Colors[theme].text }}>Carregando...</Text>
                </View>
            ) : lists.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={[styles.emptyText, { color: Colors[theme].text }]}>Você ainda não possui listas.</Text>
                    <TouchableOpacity
                        style={[styles.createButton, { backgroundColor: Colors[theme].tint }]}
                        onPress={() => router.push('/create-list')}
                    >
                        <Text style={[styles.createButtonText, { color: Colors[theme].background }]}>+ Nova Lista</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={lists}
                    contentContainerStyle={styles.listContainer}
                    renderItem={renderListCard}
                    keyExtractor={item => item.id}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors[theme].tint} />
                    }
                    ListHeaderComponent={
                        <TouchableOpacity
                            style={[styles.createButtonHeader, { backgroundColor: Colors[theme].tint }]}
                            onPress={() => router.push('/create-list')}
                        >
                            <Text style={[styles.createButtonTextHeader, { color: Colors[theme].background }]}>Criar Nova Lista</Text>
                            <Ionicons name="add" size={24} color={Colors[theme].background} />
                        </TouchableOpacity>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContainer: {
        padding: 16,
        paddingBottom: 40,
    },
    createButtonHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 12,
        marginBottom: 20,
    },
    createButtonTextHeader: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 18,
        marginBottom: 20,
    },
    createButton: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 25,
    },
    createButtonText: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    card: {
        borderRadius: 12,
        marginBottom: 16,
        padding: 16,
        // Shadow for depth
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.23,
        shadowRadius: 2.62,
        elevation: 4,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    listName: {
        fontWeight: 'bold',
        fontSize: 18,
    },
    countsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    countBadge: {
        alignItems: 'center',
    },
    countLabel: {
        color: '#888',
        fontSize: 12,
        marginBottom: 4,
    },
    countValue: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    divider: {
        width: 1,
        height: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
    }
});
