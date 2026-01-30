import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from '../hooks/use-color-scheme';
import { Colors } from '../constants/theme';
import { useAuthStore } from '../store/useAuthStore';

export default function LoginScreen() {
    const router = useRouter();
    const theme = useColorScheme() ?? 'light';
    const login = useAuthStore((state) => state.login);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!username || !password) {
            Alert.alert('Erro', 'Insira usuário e senha.');
            return;
        }

        setLoading(true);
        try {
            // Use environment variable or fallback
            const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.4:8000';
            console.log('Attempting login to:', API_URL);

            const response = await fetch(`${API_URL}/login`, {
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
                // Save user to store
                login(data.user);

                Alert.alert('Sucesso!', `Bem-vindo, ${data.user?.email || username}!`);
                // Navigate to main app
                router.replace('/(drawer)/home');
            } else {
                Alert.alert('Erro', data.detail || 'Credenciais inválidas');
            }
        } catch (error) {
            console.error('Login Error:', error);
            Alert.alert('Erro', `Falha ao conectar: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: Colors[theme].background }]}>
            <Text style={[styles.logo, { color: Colors[theme].text }]}>StreamMatch</Text>
            <Text style={[styles.title, { color: Colors[theme].text }]}>Bem-vindo de volta</Text>

            <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: Colors[theme].text }]}>Usuário</Text>
                <TextInput
                    style={[styles.input, { color: Colors[theme].text, borderColor: Colors[theme].icon, backgroundColor: theme === 'dark' ? '#333' : '#f9f9f9' }]}
                    placeholder="Digite seu usuário"
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
                    placeholder="Digite sua senha"
                    placeholderTextColor={Colors[theme].icon}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />
            </View>

            <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleLogin}
                disabled={loading}
            >
                <Text style={styles.buttonText}>{loading ? 'Carregando...' : 'Login'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.signUpButton}
                onPress={() => router.push('/register')}
            >
                <Text style={[styles.signUpText, { color: Colors[theme].text }]}>
                    Não tem login? <Text style={styles.signUpLink}>Cadastre-se</Text>.
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    logo: {
        fontSize: 34,
        fontFamily: 'GravitasOne_400Regular',
        textAlign: 'center',
        marginBottom: 80,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 40,
        textAlign: 'center',
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        marginBottom: 8,
        fontSize: 16,
        fontWeight: '500',
    },
    input: {
        borderWidth: 1,
        padding: 15,
        borderRadius: 8,
        fontSize: 16,
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
    signUpButton: {
        marginTop: 20,
        alignItems: 'center',
    },
    signUpText: {
        fontSize: 14,
    },
    signUpLink: {
        fontWeight: 'bold',
        color: '#007AFF', // Same primary color
        textDecorationLine: 'underline',
    },
});
