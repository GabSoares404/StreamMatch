import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Dimensions, ScrollView, RefreshControl, useWindowDimensions, TouchableOpacity, Alert, TextInput, Modal, KeyboardAvoidingView, Platform } from 'react-native';
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
    const [modalVisible, setModalVisible] = useState(false);
    const [newName, setNewName] = useState('');

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
            setNewName(currentList.nome_list);

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

    const handleRename = async () => {
        if (!newName.trim()) {
            Alert.alert("Erro", "O nome da lista não pode ser vazio.");
            return;
        }

        try {
            const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.1.1.4:8000';
            const response = await fetch(`${API_URL}/watchlist/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nome_list: newName }),
            });

            if (response.ok) {
                setListName(newName);
                setModalVisible(false);
                Alert.alert("Sucesso", "Nome da lista atualizado!");
            } else {
                const errorText = await response.text();
                // Check if 405 to warn user about restart
                if (response.status === 405) {
                    Alert.alert("Erro de Servidor", "O servidor precisa ser reiniciado para aplicar atualizações recentes (Erro 405).");
                } else {
                    Alert.alert("Erro", "Falha ao atualizar nome.");
                }
                console.error(`Failed to rename list. Status: ${response.status}, Details: ${errorText}`);
            }
        } catch (error) {
            console.error(error);
            Alert.alert("Erro", "Erro ao conectar com servidor.");
        }
    };

    const handleDelete = async () => {
        if (!id) return;

        Alert.alert(
            "Excluir Lista",
            "Tem certeza que deseja excluir esta lista? Esta ação não pode ser desfeita.",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Excluir",
                    style: "destructive",
                    onPress: async () => {
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
                    }
                }
            ]
        );
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
                headerTitle: listName || 'Detalhes da Lista',
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

            {/* Edit Name FAB */}
            <TouchableOpacity
                style={[styles.fab, { backgroundColor: Colors[theme].tint, bottom: 100 }]}
                onPress={() => setModalVisible(true)}
            >
                <Ionicons name="pencil" size={28} color={Colors[theme].background} />
            </TouchableOpacity>

            {/* Add Media FAB */}
            <TouchableOpacity
                style={[styles.fab, { backgroundColor: Colors[theme].tint }]}
                onPress={() => router.push(`/add-to-list?listId=${id}`)}
            >
                <Ionicons name="add" size={32} color={Colors[theme].background} />
            </TouchableOpacity>

            {/* Rename Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.centeredView}
                >
                    <View style={[styles.modalView, { backgroundColor: '#252525' }]}>
                        <Text style={[styles.modalText, { color: Colors[theme].text }]}>Alterar nome da lista</Text>
                        <TextInput
                            style={[styles.modalInput, { color: Colors[theme].text, borderColor: Colors[theme].icon }]}
                            onChangeText={setNewName}
                            value={newName}
                            placeholder="Nome da lista"
                            placeholderTextColor={Colors[theme].icon}
                            autoFocus
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.button, styles.buttonClose]}
                                onPress={() => { setModalVisible(false); setNewName(listName); }}
                            >
                                <Text style={styles.textStyle}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, { backgroundColor: Colors[theme].tint }]}
                                onPress={handleRename}
                            >
                                <Text style={[styles.textStyle, { color: Colors[theme].background }]}>Salvar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
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
    },
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: 'rgba(0,0,0,0.5)'
    },
    modalView: {
        margin: 20,
        borderRadius: 20,
        padding: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: '90%'
    },
    modalText: {
        marginBottom: 15,
        textAlign: "center",
        fontSize: 18,
        fontWeight: 'bold'
    },
    modalInput: {
        height: 40,
        width: '100%',
        borderWidth: 1,
        borderRadius: 5,
        padding: 10,
        marginBottom: 20,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 10
    },
    button: {
        borderRadius: 10,
        padding: 10,
        elevation: 2,
        minWidth: 100,
        alignItems: 'center'
    },
    buttonClose: {
        backgroundColor: "#2196F3",
    },
    textStyle: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center"
    }
});
