import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Drawer } from 'expo-router/drawer';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import Constants from 'expo-constants';
import { Text, TouchableOpacity, View } from 'react-native';
import { useThemeStore } from '../../store/useThemeStore';

function CustomDrawerContent(props: any) {
    const colorScheme = useColorScheme();
    return (
        <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 10 }}>
            <View style={{ padding: 10, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: colorScheme === 'dark' ? '#333' : '#eee' }}>
                <Text style={{
                    fontFamily: 'GravitasOne_400Regular',
                    fontSize: 20,
                    color: colorScheme === 'dark' ? '#fff' : '#000',
                }}>
                    SM
                </Text>
            </View>
            <DrawerItemList {...props} />
        </DrawerContentScrollView>
    );
}

export default function DrawerLayout() {
    const colorScheme = useColorScheme();

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <Drawer
                drawerContent={(props) => <CustomDrawerContent {...props} />}
                screenOptions={{
                    headerShown: true,
                    headerStyle: {
                        backgroundColor: colorScheme === 'dark' ? '#000' : '#fff',
                    },
                    headerTintColor: colorScheme === 'dark' ? '#fff' : '#000',
                    drawerStyle: {
                        backgroundColor: colorScheme === 'dark' ? '#121212' : '#fff',
                        width: '60%',
                        marginTop: Constants.statusBarHeight,
                    },
                    drawerLabelStyle: {
                        color: colorScheme === 'dark' ? '#fff' : '#000',
                    },
                    headerTitle: () => (
                        <Text style={{
                            fontFamily: 'GravitasOne_400Regular',
                            fontSize: 24,
                            color: colorScheme === 'dark' ? '#fff' : '#000'
                        }}>
                            StreamMatch
                        </Text>
                    ),
                    headerTitleAlign: 'center',
                    headerRight: () => {
                        const { themeMode, setThemeMode } = useThemeStore();
                        const toggleTheme = () => {
                            setThemeMode(themeMode === 'light' ? 'dark' : 'light');
                        };
                        return (
                            <TouchableOpacity onPress={toggleTheme} style={{ marginRight: 15 }}>
                                <Ionicons
                                    name={themeMode === 'dark' ? 'moon-outline' : 'sunny-outline'}
                                    size={24}
                                    color={colorScheme === 'dark' ? '#fff' : '#000'}
                                />
                            </TouchableOpacity>
                        );
                    },
                }}
            >
                <Drawer.Screen
                    name="home"
                    options={{
                        drawerLabel: 'Home',
                        title: 'StreamMatch',
                        drawerIcon: ({ size, color }) => (
                            <Ionicons name="home-outline" size={size} color={color} />
                        ),
                    }}
                />
                <Drawer.Screen
                    name="movies"
                    options={{
                        drawerLabel: 'Filmes',
                        title: 'Filmes',
                        drawerIcon: ({ size, color }) => (
                            <Ionicons name="film-outline" size={size} color={color} />
                        ),
                    }}
                />
                <Drawer.Screen
                    name="series"
                    options={{
                        drawerLabel: 'Séries',
                        title: 'Séries',
                        drawerIcon: ({ size, color }) => (
                            <Ionicons name="albums-outline" size={size} color={color} />
                        ),
                    }}
                />
                <Drawer.Screen
                    name="tv"
                    options={{
                        drawerLabel: 'TV',
                        title: 'TV',
                        drawerIcon: ({ size, color }) => (
                            <Ionicons name="tv-outline" size={size} color={color} />
                        ),
                    }}
                />
                <Drawer.Screen
                    name="animes"
                    options={{
                        drawerLabel: 'Animes',
                        title: 'Animes',
                        drawerIcon: ({ size, color }) => (
                            <Ionicons name="rocket-outline" size={size} color={color} />
                        ),
                    }}
                />
            </Drawer>
        </GestureHandlerRootView>
    );
}
