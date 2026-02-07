import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

import { useColorScheme } from '../hooks/use-color-scheme';
import { Colors } from '../constants/theme';

export default function RegisterScreen() {
    const router = useRouter();
    const theme = useColorScheme() ?? 'light';
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        if (!username || !password || !confirmPassword) {
            Alert.alert('Erro', 'Preencha todos os campos.');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Erro', 'As senhas não são iguais.');
            return;
        }

        setLoading(true);
        try {
            const API_URL = process.env.EXPO_PUBLIC_API_URL;
            // Fallback for development if env is not set
            const apiUrl = API_URL || 'http://10.1.1.4:8000';

            const response = await fetch(`${apiUrl}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user: username,
                    password: password,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                Alert.alert(
                    'Sucesso!',
                    'Conta criada com sucesso! Faça login para continuar.',
                    [
                        { text: 'OK', onPress: () => router.back() }
                    ]
                );
            } else {
                Alert.alert('Erro', data.detail || 'Falha ao criar conta');
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Erro', 'Falha ao conectar ao servidor.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: Colors[theme].background }]}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <Text style={styles.backButtonText}>← Voltar</Text>
            </TouchableOpacity>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={[styles.title, { color: Colors[theme].text }]}>Crie sua conta</Text>

                <View style={styles.inputContainer}>
                    <Text style={[styles.label, { color: Colors[theme].text }]}>Usuário</Text>
                    <TextInput
                        style={[styles.input, { color: Colors[theme].text, borderColor: Colors[theme].icon, backgroundColor: theme === 'dark' ? '#333' : '#f9f9f9' }]}
                        placeholder="Escolha um nome de usuário"
                        placeholderTextColor={Colors[theme].icon}
                        value={username}
                        onChangeText={setUsername}
                        autoCapitalize="none"
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={[styles.label, { color: Colors[theme].text }]}>Senha</Text>
                    <TextInput
                        style={[styles.input, { color: Colors[theme].text, borderColor: Colors[theme].icon, backgroundColor: theme === 'dark' ? '#333' : '#f9f9f9' }]}
                        placeholder="Escolha uma senha"
                        placeholderTextColor={Colors[theme].icon}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={[styles.label, { color: Colors[theme].text }]}>Confirmar Senha</Text>
                    <TextInput
                        style={[styles.input, { color: Colors[theme].text, borderColor: Colors[theme].icon, backgroundColor: theme === 'dark' ? '#333' : '#f9f9f9' }]}
                        placeholder="Repita a senha"
                        placeholderTextColor={Colors[theme].icon}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry
                    />
                </View>

                <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleRegister}
                    disabled={loading}
                >
                    <Text style={styles.buttonText}>{loading ? 'Criando conta...' : 'Cadastrar'}</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: 50, // Status bar spacing
    },
    backButton: {
        position: 'absolute',
        top: 50,
        left: 20,
        zIndex: 10,
        padding: 5,
    },
    backButtonText: {
        fontSize: 18,
        color: '#007AFF',
        fontWeight: '500',
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 40,
        textAlign: 'center',
        color: '#333',
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        marginBottom: 8,
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 15,
        borderRadius: 8,
        fontSize: 16,
        backgroundColor: '#f9f9f9',
    },
    button: {
        backgroundColor: '#007AFF', // Example primary color
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    buttonDisabled: {
        backgroundColor: '#a0c4ff',
    },
});
