import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import theme from '../theme';

export default function ProfileScreen() {
    return (
        <View style={styles.screen}>
            <Text style={theme.type.h2}>Profile</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.background,
    },
});