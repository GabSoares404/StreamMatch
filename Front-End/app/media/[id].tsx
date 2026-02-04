import { useLocalSearchParams, Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Dimensions, ActivityIndicator } from 'react-native';
import { fetchGenericDetails, MediaDetail, getSimklIdFromTmdb, fetchDetailsFromTmdb } from '../../services/api';
import { useColorScheme } from '../../hooks/use-color-scheme';
import { Colors } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function MediaDetails() {
    const { id, type, source } = useLocalSearchParams();
    const [media, setMedia] = useState<MediaDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const theme = useColorScheme() ?? 'light';

    useEffect(() => {
        loadDetails();
    }, [id, type]);

    const loadDetails = async () => {
        setLoading(true);
        if (id && type) {
            let data;
            if (source === 'tmdb') {
                const simklId = await getSimklIdFromTmdb(Number(id));
                if (simklId) {
                    data = await fetchGenericDetails(simklId, type as 'movie' | 'anime' | 'tv');
                } else {
                    // Fallback to TMDb-only details if Simkl resolution fails
                    data = await fetchDetailsFromTmdb(Number(id), type as 'movie' | 'anime' | 'tv');
                }
            } else {
                data = await fetchGenericDetails(Number(id), type as 'movie' | 'anime' | 'tv');
            }
            setMedia(data);
        }
        setLoading(false);
    };

    const getStatusText = (status: string | undefined) => {
        if (!status) return '?';
        const map: Record<string, string> = {
            'ended': 'Finalizado',
            'airing': 'Em Lançamento',
            'released': 'Lançado',
            'upcoming': 'Em Breve',
            'production': 'Em Produção'
        };
        return map[status.toLowerCase()] || status;
    };

    if (loading) {
        return (
            <View style={[styles.center, { backgroundColor: Colors[theme].background }]}>
                <ActivityIndicator size="large" color={Colors[theme].tint} />
            </View>
        );
    }

    if (!media) {
        return (
            <View style={[styles.center, { backgroundColor: Colors[theme].background }]}>
                <Text style={{ color: Colors[theme].text }}>Mídia não encontrada.</Text>
            </View>
        );
    }

    const posterUrl = media.poster
        ? (media.poster.toString().startsWith('http') ? media.poster : `https://simkl.in/posters/${media.poster}_m.jpg`)
        : null;
    const fanartUrl = media.fanart
        ? (media.fanart.toString().startsWith('http') ? media.fanart : `https://simkl.in/fanart/${media.fanart}_medium.jpg`)
        : null;

    return (
        <ScrollView style={[styles.container, { backgroundColor: Colors[theme].background }]}>
            <Stack.Screen options={{ title: media.title || 'Detalhes', headerBackTitle: 'Voltar' }} />

            {/* Header Area - Enforces height even if fanart is missing */}
            <View style={{ width: width, height: 220, position: 'relative', backgroundColor: '#1a1a1a' }}>
                {fanartUrl && <Image source={{ uri: fanartUrl }} style={styles.fanart} />}
            </View>

            <View style={styles.posterContainer}>
                {posterUrl ? (
                    <Image source={{ uri: posterUrl }} style={styles.poster} />
                ) : (
                    <View style={[styles.poster, { backgroundColor: '#333', justifyContent: 'center', alignItems: 'center' }]}>
                        <Ionicons name="image-outline" size={40} color="#fff" />
                    </View>
                )}
            </View>

            <View style={styles.content}>
                <Text style={[styles.title, { color: Colors[theme].text }]}>{media.title}</Text>

                <View style={styles.row}>
                    <Text style={[styles.tag, { color: Colors[theme].icon }]}>{media.year} • </Text>
                    <Text style={[styles.tag, { color: Colors[theme].icon }]}>{media.runtime ? `${media.runtime} min` : 'N/A'} • </Text>
                    <Text style={[styles.tag, { color: Colors[theme].icon }]}>{media.type.toUpperCase()}</Text>
                    {media.country && <Text style={[styles.tag, { color: Colors[theme].icon }]}> • {media.country.toUpperCase()}</Text>}
                </View>

                {(media.type === 'anime' || media.type === 'tv') && media.status && (
                    <View style={[styles.section, { marginBottom: 12 }]}>
                        <Text style={[styles.text, { color: Colors[theme].icon, fontWeight: 'bold' }]}>
                            Status: <Text style={{ color: Colors[theme].text, fontWeight: 'normal' }}>{getStatusText(media.status)}</Text>
                        </Text>
                    </View>
                )}

                <View style={[styles.stats, { backgroundColor: theme === 'dark' ? '#1E1E1E' : '#F0F0F0' }]}>
                    <View style={styles.statItem}>
                        <Text style={[styles.statLabel, { color: Colors[theme].icon }]}>Nota IMDb</Text>
                        <Text style={[styles.statValue, { color: Colors[theme].text }]}>{media.ratings?.imdb?.rating?.toFixed(1) || '-'}</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={[styles.statLabel, { color: Colors[theme].icon }]}>Nota Simkl</Text>
                        <Text style={[styles.statValue, { color: Colors[theme].text }]}>{media.ratings?.simkl?.rating?.toFixed(1) || '-'}</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={[styles.statLabel, { color: Colors[theme].icon }]}>Nota TMDB</Text>
                        <Text style={[styles.statValue, { color: Colors[theme].text }]}>{media.tmdbRating?.toFixed(1) || '-'}</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Disponível em</Text>
                    {media.providers && media.providers.length > 0 ? (
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                            {media.providers.map((p) => (
                                <View key={p.provider_id} style={{ alignItems: 'center', width: 60 }}>
                                    <Image
                                        source={{ uri: p.logo_path }}
                                        style={{ width: 50, height: 50, borderRadius: 12, marginBottom: 4 }}
                                    />
                                    <Text
                                        numberOfLines={1}
                                        style={{ fontSize: 10, color: Colors[theme].icon, textAlign: 'center' }}
                                    >
                                        {p.provider_name}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    ) : (
                        <Text style={{ color: Colors[theme].icon, fontStyle: 'italic', opacity: 0.7 }}>
                            Ainda não disponível para streaming.
                        </Text>
                    )}
                </View>

            </View>
        </ScrollView>
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
    fanart: {
        width: width,
        height: 220,
        opacity: 0.5,
    },
    posterContainer: {
        position: 'absolute',
        top: 130, // Reverted to explicit TOP
        left: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 5,
        elevation: 8,
    },
    poster: {
        width: 100,
        height: 150,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#fff',
    },
    content: {
        marginTop: 65, // Reverted to original margin
        padding: 20,
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    row: {
        flexDirection: 'row',
        marginBottom: 20,
        opacity: 0.8,
    },
    tag: {
        fontSize: 14,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        color: '#E50914',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    text: {
        fontSize: 16,
    },
    stats: {
        flexDirection: 'row',
        justifyContent: 'space-around',
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
        fontSize: 15,
    },
});
