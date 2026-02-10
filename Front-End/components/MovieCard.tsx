import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, Image, TouchableOpacity, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UnifiedMedia } from '../services/api';

interface MovieCardProps {
    movie: UnifiedMedia;
    onPress: () => void;
    width: number; // Pass width explicitly for grid support
    style?: any;
}

const IMAGE_ASPECT_RATIO = 1.5; // Standard poster ratio approx

import { useColorScheme } from '../hooks/use-color-scheme';
import { Colors } from '../constants/theme';

export default function MovieCard({ movie, onPress, width, style }: MovieCardProps) {
    const theme = useColorScheme() ?? 'light';
    const [activeIndex, setActiveIndex] = useState(0);
    const scrollRef = useRef<ScrollView>(null);

    const posterUri = movie.poster && movie.poster !== 'null'
        ? (movie.poster.toString().startsWith('http') ? movie.poster : `https://simkl.in/posters/${movie.poster}_m.jpg`)
        : null;

    // ... (fanartUri logic can stay or be similar)

    const images = { uri: posterUri, type: 'Poster' };

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const slideSize = event.nativeEvent.layoutMeasurement.width;
        const index = event.nativeEvent.contentOffset.x / slideSize;
        const roundIndex = Math.round(index);
        setActiveIndex(roundIndex);
    };

    return (
        <View style={[
            styles.card,
            { width, backgroundColor: theme === 'dark' ? '#1E1E1E' : '#FFF' },
            style
        ]}>
            <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={styles.touchableArea}>
                <View style={styles.imageWrapper}>
                    {posterUri ? (
                        <ScrollView
                            ref={scrollRef}
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            onScroll={handleScroll}
                            scrollEventThrottle={16}
                            style={{ width: width, height: width * IMAGE_ASPECT_RATIO }}
                        >
                            <Image
                                source={{ uri: posterUri }}
                                style={{ width: width, height: width * IMAGE_ASPECT_RATIO, backgroundColor: '#333' }}
                                resizeMode="cover"
                            />
                        </ScrollView>
                    ) : (
                        <View style={{ width: width, height: width * IMAGE_ASPECT_RATIO, backgroundColor: '#333', justifyContent: 'center', alignItems: 'center', padding: 8 }}>
                            <Ionicons name="image-outline" size={32} color={Colors[theme].icon} style={{ marginBottom: 8 }} />
                            <Text style={{ color: Colors[theme].text, textAlign: 'center', fontSize: 12 }} numberOfLines={3}>
                                {movie.title}
                            </Text>
                        </View>
                    )}

                    {/* Rating Badge Overlay */}
                    {!!movie.rating && (
                        <View style={styles.ratingBadgeOverlay}>
                            <Text style={styles.ratingText}>{movie.rating?.toFixed(1)}</Text>
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#1E1E1E',
        borderRadius: 12, // Slightly smaller radius for grid
        overflow: 'hidden',
        marginBottom: 16,
        marginHorizontal: 4, // Spacing between grid items
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    touchableArea: {
        flex: 1,
    },
    imageWrapper: {
        position: 'relative',
    },
    arrowContainer: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 4,
    },
    arrowButton: {
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 20,
        padding: 4,
    },
    dotsContainer: {
        position: 'absolute',
        bottom: 8,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 6,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    // infoContainer & title styles removed
    ratingBadgeOverlay: {
        position: 'absolute',
        top: 8, // Moved to TOP
        right: 8,
        backgroundColor: 'rgba(0,0,0,0.7)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#E50914',
    },
    ratingText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 12,
    }
});
