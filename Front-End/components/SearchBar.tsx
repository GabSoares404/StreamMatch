import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '../hooks/use-color-scheme';
import { Colors } from '../constants/theme';

interface SearchBarProps {
    searchBarText: string;
    value?: string;
    onChangeText?: (text: string) => void;
    onSubmit?: () => void;
}

export default function SearchBar({ searchBarText, value, onChangeText, onSubmit }: SearchBarProps) {
    const theme = useColorScheme() ?? 'light';

    return (
        <View style={[styles.searchContainer, { backgroundColor: Colors[theme].background }]}>
            <View style={[styles.searchBar, { backgroundColor: Colors[theme].background === '#151718' ? '#2f3336' : '#f0f0f0' }]}>
                <Ionicons name="search" size={20} color={Colors[theme].icon} style={styles.searchIcon} />
                <TextInput
                    style={[styles.input, { color: Colors[theme].text }]}
                    placeholder={searchBarText}
                    placeholderTextColor={Colors[theme].icon}
                    value={value}
                    onChangeText={onChangeText}
                    onSubmitEditing={onSubmit}
                    returnKeyType="search"
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    searchContainer: {
        paddingHorizontal: 0,
        paddingBottom: 15,
        paddingTop: 5,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 10,
    },
    searchIcon: {
        marginRight: 8,
    },
    input: {
        flex: 1,
        fontSize: 16,
    },
});
