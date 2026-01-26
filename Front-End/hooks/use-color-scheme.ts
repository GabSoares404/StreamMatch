import { useColorScheme as useNativeColorScheme } from 'react-native';
import { useThemeStore } from '../store/useThemeStore';

export function useColorScheme() {
    const { themeMode } = useThemeStore();
    const systemScheme = useNativeColorScheme();

    if (themeMode === 'system') {
        return systemScheme ?? 'light';
    }
    return themeMode;
}
