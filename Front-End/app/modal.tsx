import { Link, Redirect } from 'expo-router';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function Index() {
  return <Redirect href="/login" />;
}
