import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
    const router = useRouter();
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
            const API_URL = process.env.EXPO_PUBLIC_API_URL;

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
                Alert.alert('Sucesso!', `Bem-vindo, ${data.user?.email || username}!`);
                // Navigate to main app
                // router.replace('/(tabs)');
            } else {
                Alert.alert('Erro', data.detail || 'Credenciais inválidas');
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Erro', 'Falha ao conectar ao servidor. Verifique sua conexão com a internet ou a URL do servidor.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Bem-vindo de volta</Text>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Usuário</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Digite seu usuário"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                />
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Senha</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Digite sua senha"
                    value={password}
                    onChangeText={setPassword}
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
                onPress={() => Alert.alert('Cadastro', 'Funcionalidade de cadastro em breve!')}
            >
                <Text style={styles.signUpText}>
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
        backgroundColor: '#fff',
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
    signUpButton: {
        marginTop: 20,
        alignItems: 'center',
    },
    signUpText: {
        fontSize: 14,
        color: '#333',
    },
    signUpLink: {
        fontWeight: 'bold',
        color: '#007AFF', // Same primary color
        textDecorationLine: 'underline',
    },
});
