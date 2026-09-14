import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import theme from '../theme';

export default class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { error: null };
    }

    static getDerivedStateFromError(error) {
        return { error };
    }

    componentDidCatch(error, info) {
        console.warn('[riff] caught by boundary:', error.message, info.componentStack);
    }

    render() {
        if (!this.state.error) return this.props.children;

        return (
            <View style={styles.screen}>
                <Text style={styles.emoji}>🙃</Text>
                <Text style={theme.type.h2}>Something broke</Text>
                <Text style={styles.detail}>{this.state.error.message}</Text>
                <Pressable
                    onPress={() => this.setState({ error: null })}
                    style={styles.button}
                >
                    <Text style={styles.buttonText}>Try again</Text>
                </Pressable>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
        gap: 10,
        backgroundColor: theme.colors.background,
    },
    emoji: { fontSize: 44 },
    detail: { ...theme.type.small, textAlign: 'center' },
    button: {
        marginTop: 12,
        paddingVertical: 10,
        paddingHorizontal: 24,
        borderRadius: theme.radius.pill,
        backgroundColor: theme.colors.brand,
    },
    buttonText: { color: theme.colors.onBrand, fontWeight: '700' },
});