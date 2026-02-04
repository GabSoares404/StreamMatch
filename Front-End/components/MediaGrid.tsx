import React from 'react';
import { View, FlatList, ActivityIndicator, StyleSheet, Text, useWindowDimensions, RefreshControl } from 'react-native';
import MovieCard from './MovieCard';
import { UnifiedMedia } from '../services/api';
import { useColorScheme } from '../hooks/use-color-scheme';
import { Colors } from '../constants/theme';
import { useRouter } from 'expo-router';

// Config
const CONTAINER_PADDING = 10;
const ITEM_MARGIN = 4;
const MIN_CARD_WIDTH = 160;

interface MediaGridProps {
    data: UnifiedMedia[];
    isLoading: boolean;
    title: string;
    ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null;
    refreshing?: boolean;
    onRefresh?: () => void;
}

export default function MediaGrid({ data, isLoading, title, ListHeaderComponent, refreshing, onRefresh }: MediaGridProps) {
    const theme = useColorScheme() ?? 'light';
    const router = useRouter();
    const { width } = useWindowDimensions();

    // Calculate dynamic columns
    const availableWidth = width - (CONTAINER_PADDING * 2);
    const numColumns = Math.floor(availableWidth / (MIN_CARD_WIDTH + (ITEM_MARGIN * 2)));
    const finalColumns = Math.max(2, numColumns);
    const cardWidth = (availableWidth - (ITEM_MARGIN * 2 * finalColumns)) / finalColumns;

    if (isLoading) {
        return (
            <View style={[styles.center, { backgroundColor: Colors[theme].background }]}>
                <ActivityIndicator size="large" color={Colors[theme].tint} />
                <Text style={[styles.loadingText, { color: Colors[theme].text }]}>Carregando {title}...</Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: Colors[theme].background }]}>
            <FlatList
                key={`grid-${finalColumns}`}
                data={data}
                keyExtractor={(item) => item.id.toString()}
                numColumns={finalColumns}
                renderItem={({ item }) => (
                    <MovieCard
                        movie={item}
                        width={cardWidth}
                        onPress={() => {
                            router.push({
                                pathname: '/media/[id]',
                                params: { id: item.id, type: item.type, source: item.source || 'simkl' }
                            });
                        }}
                    />
                )}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                columnWrapperStyle={styles.columnWrapper}
                ListHeaderComponent={ListHeaderComponent}
                refreshControl={
                    onRefresh ? (
                        <RefreshControl refreshing={refreshing || false} onRefresh={onRefresh} tintColor={Colors[theme].tint} />
                    ) : undefined
                }
            />
        </View>
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
    loadingText: {
        marginTop: 12,
        fontSize: 16,
    },
    list: {
        paddingVertical: 20,
        paddingHorizontal: CONTAINER_PADDING,
    },
    columnWrapper: {
        justifyContent: 'flex-start',
    }
});
