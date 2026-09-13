import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import SearchScreen from '../screens/SearchScreen';
import YourListScreen from '../screens/YourListScreen';
import ProfileScreen from '../screens/ProfileScreen';
import RankFlowScreen from '../screens/RankFlowScreen';
import { useLibrary } from '../state/LibraryContext';
import theme from '../theme';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const navTheme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        primary: theme.colors.brand,
        background: theme.colors.background,
        card: theme.colors.card,
        text: theme.colors.text,
        border: theme.colors.border,
    },
};

function TabIcon({ emoji, focused }) {
    return <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.45 }}>{emoji}</Text>;
}

function Tabs() {
    const { entries } = useLibrary();

    return (
        <Tab.Navigator
            screenOptions={{
                headerStyle: { backgroundColor: theme.colors.card },
                headerTitleStyle: { fontWeight: '800', color: theme.colors.text },
                tabBarActiveTintColor: theme.colors.brand,
                tabBarInactiveTintColor: theme.colors.textMuted,
                tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
            }}
        >
            <Tab.Screen
                name="Search"
                component={SearchScreen}
                options={{
                    tabBarIcon: ({ focused }) => <TabIcon emoji="🔎" focused={focused} />,
                }}
            />
            <Tab.Screen
                name="YourList"
                component={YourListScreen}
                options={{
                    title: 'Your list',
                    tabBarBadge: entries.length || undefined,
                    tabBarIcon: ({ focused }) => <TabIcon emoji="🎵" focused={focused} />,
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    tabBarIcon: ({ focused }) => <TabIcon emoji="👤" focused={focused} />,
                }}
            />
        </Tab.Navigator>
    );
}

export default function RootNavigator() {
    const { ready } = useLibrary();

    if (!ready) {
        return (
            <View style={styles.splash}>
                <ActivityIndicator size="large" color={theme.colors.brand} />
            </View>
        );
    }

    return (
        <NavigationContainer theme={navTheme}>
            <Stack.Navigator>
                <Stack.Screen
                    name="Tabs"
                    component={Tabs}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="RankFlow"
                    component={RankFlowScreen}
                    options={{ presentation: 'modal', headerShown: false }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    splash: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.background,
    },
});