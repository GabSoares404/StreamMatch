import { View, Text, StyleSheet } from 'react-native';
import { useColorScheme } from '../../hooks/use-color-scheme';
import { Colors } from '../../constants/theme';

export default function Series() {
    const theme = useColorScheme() ?? 'light';
    return (
        <View style={[styles.container, { backgroundColor: Colors[theme].background }]}>
            <Text style={[styles.text, { color: Colors[theme].text }]}>Séries (Em Breve)</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#121212',
    },
    text: {
        color: '#fff',
        fontSize: 20,
    },
});
