import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuthStore } from '../../store/useAuthStore';
import { useColorScheme } from '../../hooks/use-color-scheme';
import { Colors } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
    const user = useAuthStore((state) => state.user);
    const theme = useColorScheme() ?? 'light';
    const styles = createStyles(theme);

    return (
        <View style={styles.container}>
            <View style={styles.avatarContainer}>
                <Ionicons name="person-circle-outline" size={100} color={Colors[theme].text} />
            </View>

            <Text style={styles.title}>Perfil do Usuário</Text>

            <View style={styles.infoContainer}>
                <Text style={styles.label}>Nome de Usuário:</Text>
                <Text style={styles.value}>{user?.user || 'Desconhecido'}</Text>
            </View>

            {user?.email && (
                <View style={styles.infoContainer}>
                    <Text style={styles.label}>Email:</Text>
                    <Text style={styles.value}>{user.email}</Text>
                </View>
            )}
        </View>
    );
}

const createStyles = (theme: 'light' | 'dark') => StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        padding: 20,
        backgroundColor: Colors[theme].background,
    },
    avatarContainer: {
        marginTop: 50,
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 40,
        color: Colors[theme].text,
    },
    infoContainer: {
        width: '100%',
        padding: 15,
        borderRadius: 10,
        backgroundColor: theme === 'dark' ? '#333' : '#f0f0f0',
        marginBottom: 15,
    },
    label: {
        fontSize: 14,
        color: Colors[theme].icon,
        marginBottom: 5,
    },
    value: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors[theme].text,
    },
});
