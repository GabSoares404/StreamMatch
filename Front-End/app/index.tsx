import { Redirect } from 'expo-router';

export default function Index() {
    // Redirecting to the initial route of the drawer
    return <Redirect href="/(drawer)/home" />;
}
