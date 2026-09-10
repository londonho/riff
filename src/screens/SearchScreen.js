import React, { useCallback, useEffect, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    FlatList,
    ActivityIndicator,
    StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SongCard from '../components/SongCard';
import Button from '../components/Button';
import theme from '../theme';
import { searchSongs } from '../api/itunes';

export default function SearchScreen() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [status, setStatus] = useState('idle');
    const [error, setError] = useState(null);

    const runSearch = useCallback(async (term) => {
        const trimmed = term.trim();

        if (trimmed.length < 2) {
            setResults([]);
            setError(null);
            setStatus('idle');
            return;
        }

        setStatus('loading');
        setError(null);

        try {
            const songs = await searchSongs(trimmed);
            setResults(songs);
            setStatus(songs.length ? 'success' : 'empty');
        } catch (err) {
            setResults([]);
            setError(err.userMessage || 'Something went wrong. Please try again.');
            setStatus('error');
        }
    }, []);

    useEffect(() => {
        runSearch(query);
    }, [query, runSearch]);

    function renderBody() {
        if (status === 'idle') {
            return (
                <View style={styles.center}>
                    <Text style={styles.muted}>Search for a song to get started.</Text>
                </View>
            );
        }
        if (status === 'loading') {
            return (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={theme.colors.brand} />
                </View>
            );
        }
        if (status === 'empty') {
            return (
                <View style={styles.center}>
                    <Text style={styles.emptyTitle}>No songs for "{query.trim()}"</Text>
                    <Text style={styles.muted}>Check the spelling, or try the artist name.</Text>
                </View>
            );
        }
        if (status === 'error') {
            return (
                <View style={styles.center}>
                    <Text style={styles.errorText}>{error}</Text>
                    <Button title="Try again" onPress={() => runSearch(query)} />
                </View>
            );
        }
        return null;
    }

    return (
        <SafeAreaView style={styles.screen}>
            <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search songs, artists, albums"
                placeholderTextColor={theme.colors.textMuted}
                autoCorrect={false}
                autoCapitalize="none"
                style={styles.input}
            />
            <FlatList
                data={status === 'success' ? results : []}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <SongCard title={item.title} artist={item.artist} album={item.artist} />
                )}
                ListEmptyComponent={renderBody()}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.listContent}
            />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    input: {
        height: 46,
        marginHorizontal: 16,
        marginTop: 12,
        marginBottom: 8,
        paddingHorizontal: 14,
        backgroundColor: theme.colors.card,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.pill,
        color: theme.colors.text,
        fontSize: 15,
    },
    listContent: {
        paddingBottom: 40,
        flexGrow: 1,
    },
    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
        gap: 12,
    },
    muted: {
        ...theme.type.body,
        color: theme.colors.textMuted,
        textAlign: 'center',
    },
    emptyTitle: {
        ...theme.type.h3,
        textAlign: 'center',
    },
    errorText: {
        ...theme.type.nody,
        color: theme.colors.text,
        textAlign: 'center',
    },
});