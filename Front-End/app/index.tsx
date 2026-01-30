import { Redirect } from 'expo-router';
import { useAuthStore } from '../store/useAuthStore';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';

export default function Index() {
    const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
    // We might want to wait for hydration (restore state from storage)
    // Zustand persist middleware usually handles hydration automatically, 
    // but there might be a split second where it's default (false).
    // However, for simplicity let's rely on the state. 
    // Ideally we check if `_hasHydrated` if exposed, but standard useAuthStore usage:

    // A separate check for "isReady" might be needed if we want to avoid flickering.
    // But since the store is synchronous after hydration (which happens fast on async storage initialization), 
    // we can try a simple check.

    if (isLoggedIn) {
        return <Redirect href="/(drawer)/home" />;
    }

    return <Redirect href="/login" />;
}
