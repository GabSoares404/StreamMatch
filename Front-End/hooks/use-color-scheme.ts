import { useColorScheme as useNativeColorScheme } from 'react-native';
import { useThemeStore } from '../store/useThemeStore';

export function useColorScheme(): 'light' | 'dark' {
    const { themeMode } = useThemeStore();
    const systemScheme = useNativeColorScheme();

    if (themeMode === 'system') {
        return (systemScheme === 'dark' ? 'dark' : 'light');
    }
    return themeMode === 'dark' ? 'dark' : 'light';
}
