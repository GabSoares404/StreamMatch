import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import MovieCard from './MovieCard';
import { UnifiedMedia } from '../services/api';
import { useColorScheme } from '../hooks/use-color-scheme';
import { Colors } from '../constants/theme';

interface TrendingSliderProps {
    data: UnifiedMedia[];
    title: string;
    route: any; // Using exact Expo Router type is tricky without generics, 'any' or string is practical here
}

const CARD_WIDTH = 140; // Fixed width for slider items
const ITEM_SPACING = 10;

export default function TrendingSlider({ data, title, route }: TrendingSliderProps) {
    const router = useRouter();
    const theme = useColorScheme() ?? 'light';

    // Limit to 12 items
    const sliderData = data.slice(0, 12);

    const renderFooter = () => (
        <TouchableOpacity
            style={[styles.seeMoreCard, { backgroundColor: theme === 'dark' ? '#1E1E1E' : '#EEE' }]}
            onPress={() => router.push(route)}
        >
            <View style={styles.seeMoreContent}>
                <View style={[styles.iconContainer, { backgroundColor: Colors[theme].tint }]}>
                    <Ionicons
                        name="arrow-forward"
                        size={24}
                        color={theme === 'dark' ? '#000' : '#FFF'}
                    />
                </View>
                <Text style={[styles.seeMoreText, { color: Colors[theme].text }]}>Ver mais</Text>
            </View>
        </TouchableOpacity>
    );

    if (sliderData.length === 0) return null;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: Colors[theme].text }]}>{title}</Text>
                <TouchableOpacity onPress={() => router.push(route)}>
                    <Text style={{ color: Colors[theme].tint, fontSize: 14 }}>Ver tudo</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={sliderData}
                horizontal
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={{ marginRight: ITEM_SPACING }}>
                        <MovieCard
                            movie={item}
                            width={CARD_WIDTH}
                            onPress={() => {
                                router.push({
                                    pathname: '/media/[id]',
                                    params: { id: item.id, type: item.type, source: item.source || 'simkl' }
                                });
                            }}
                        />
                    </View>
                )}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                ListFooterComponent={renderFooter}
                ListFooterComponentStyle={{ justifyContent: 'center', marginLeft: ITEM_SPACING }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 30,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 15,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    listContent: {
        paddingHorizontal: 20,
    },
    seeMoreCard: {
        width: CARD_WIDTH,
        height: CARD_WIDTH * 1.5, // Match MovieCard aspect ratio
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    seeMoreContent: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    seeMoreText: {
        fontWeight: '600',
        fontSize: 16,
    }
});
