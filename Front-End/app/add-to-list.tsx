import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Image, Alert } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/theme';
import { useColorScheme } from '../hooks/use-color-scheme';
import SearchBar from '../components/SearchBar';
import { UnifiedMedia, searchMovies, searchTV, searchAnime } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';

export default function AddToListScreen() {
    const theme = useColorScheme() ?? 'light';
    const router = useRouter();
    const { listId } = useLocalSearchParams<{ listId: string }>();
    const [searchText, setSearchText] = useState('');
    const [searchResults, setSearchResults] = useState<UnifiedMedia[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedItems, setSelectedItems] = useState<UnifiedMedia[]>([]);
    const { user } = useAuthStore();

    const handleSearch = async () => {
        if (!searchText.trim()) return;
        setLoading(true);
        try {
            const [movies, tv, anime] = await Promise.all([
                searchMovies(searchText),
                searchTV(searchText),
                searchAnime(searchText)
            ]);
            setSearchResults([...movies, ...tv, ...anime]);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const addItem = (item: UnifiedMedia) => {
        if (selectedItems.some(i => i.id === item.id && i.type === item.type)) {
            Alert.alert("Item já selecionado", "Este título já está na lista de adição.");
            return;
        }
        setSelectedItems([...selectedItems, item]);
    };

    const removeItem = (id: number, type: string) => {
        setSelectedItems(selectedItems.filter(i => !(i.id === id && i.type === type)));
    };

    const handleSave = async () => {
        if (selectedItems.length === 0) {
            Alert.alert("Nenhum item", "Selecione pelo menos um título para adicionar.");
            return;
        }
        if (!listId) return;

        try {
            const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.1.1.4:8000';

            // Construct payload matching backend expectation for update
            // Note: Reuse CreateWatchlist structure for simplicity if backend allows, or match logic
            const payload = {
                id_user: user?.id || "", // Not strictly needed for update logic implemented but good practice
                nome_list: "update", // Placeholder, ignored by update logic
                items: selectedItems.map(item => ({ id: item.id, type: item.type }))
            };

            const response = await fetch(`${API_URL}/watchlist/${listId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(`Server Error (${response.status}): ${text}`);
            }

            Alert.alert("Sucesso", "Títulos adicionados com sucesso!");
            router.back();
        } catch (error: any) {
            console.error(error);
            Alert.alert("Erro", error.message);
        }
    };

    const renderSearchItem = ({ item }: { item: UnifiedMedia }) => (
        <View style={styles.searchItem}>
            <Image
                source={{ uri: item.poster && item.poster.startsWith('http') ? item.poster : `https://simkl.in/posters/${item.poster}_m.jpg` }}
                style={styles.searchItemPoster}
            />
            <View style={styles.searchItemInfo}>
                <Text style={[styles.searchItemTitle, { color: Colors[theme].text }]}>{item.title}</Text>
                <Text style={[styles.searchItemType, { color: Colors[theme].icon }]}>{item.type.toUpperCase()} • {item.year}</Text>
            </View>
            <TouchableOpacity onPress={() => addItem(item)} style={styles.addButton}>
                <Ionicons name="add-circle" size={32} color={Colors[theme].tint} />
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: Colors[theme].background }]}>
            <Stack.Screen options={{ title: 'Adicionar Títulos', headerBackTitle: 'Voltar' }} />

            <View style={styles.inputSection}>
                <SearchBar
                    searchBarText="Pesquisar filmes, séries..."
                    value={searchText}
                    onChangeText={(text) => {
                        setSearchText(text);
                        if (text.trim() === '') setSearchResults([]);
                    }}
                    onSubmit={handleSearch}
                />
            </View>

            {selectedItems.length > 0 && (
                <View style={styles.selectedSection}>
                    <Text style={[styles.label, { color: Colors[theme].text, marginBottom: 10 }]}>Selecionados ({selectedItems.length})</Text>
                    <FlatList
                        data={selectedItems}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(item) => `${item.type}-${item.id}`}
                        renderItem={({ item }) => (
                            <View style={styles.selectedItem}>
                                <Image
                                    source={{ uri: item.poster && item.poster.startsWith('http') ? item.poster : `https://simkl.in/posters/${item.poster}_m.jpg` }}
                                    style={styles.selectedPoster}
                                />
                                <TouchableOpacity
                                    style={styles.removeButton}
                                    onPress={() => removeItem(item.id, item.type)}
                                >
                                    <Ionicons name="close-circle" size={24} color="red" />
                                </TouchableOpacity>
                            </View>
                        )}
                    />
                </View>
            )}

            <View style={styles.resultsContainer}>
                {loading ? (
                    <ActivityIndicator size="large" color={Colors[theme].tint} />
                ) : (
                    <FlatList
                        data={searchResults}
                        keyExtractor={(item) => `${item.type}-${item.id}`}
                        renderItem={renderSearchItem}
                        ListEmptyComponent={
                            searchText.length > 0 && !loading ? (
                                <Text style={{ color: Colors[theme].icon, textAlign: 'center', marginTop: 20 }}>Nenhum resultado encontrado.</Text>
                            ) : null
                        }
                    />
                )}
            </View>

            <TouchableOpacity style={[styles.saveButton, { backgroundColor: Colors[theme].tint }]} onPress={handleSave}>
                <Text style={[styles.saveButtonText, { color: Colors[theme].background }]}>Adicionar à Lista</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    inputSection: {
        marginBottom: 16,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    resultsContainer: {
        flex: 1,
        marginBottom: 90,
    },
    searchItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        padding: 8,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 8,
    },
    searchItemPoster: {
        width: 40,
        height: 60,
        borderRadius: 4,
        marginRight: 12,
        backgroundColor: '#333'
    },
    searchItemInfo: {
        flex: 1,
    },
    searchItemTitle: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    searchItemType: {
        fontSize: 12,
        marginTop: 4,
    },
    addButton: {
        padding: 8,
    },
    selectedSection: {
        marginBottom: 16,
        height: 110,
    },
    selectedItem: {
        marginRight: 10,
        position: 'relative',
    },
    selectedPoster: {
        width: 60,
        height: 90,
        borderRadius: 6,
        backgroundColor: '#333'
    },
    removeButton: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: 'white',
        borderRadius: 12,
    },
    saveButton: {
        position: 'absolute',
        bottom: 50,
        left: 16,
        right: 16,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    }
});
