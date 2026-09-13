import React from 'react';
import {
    View,
    Text,
    TextInput,
    FlatList,
    ActivityIndicator,
    StyleSheet,
} from 'react-native';
import SongCard from '../components/SongCard';
import Button from '../components/Button';
import theme from '../theme';
import useSongSearch from '../lib/useSongSearch';

export default function SearchScreen({ navigation }) {
    const { query, setQuery, results, status, error, retry } = useSongSearch();

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
                    <Button title="Try again" onPress={retry} />
                </View>
            );
        }
        return null;
    }

    return (
        <View style={styles.screen}>
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
                    <SongCard 
                        title={item.title} 
                        artist={item.artist} 
                        album={item.album}
                        onPress={() => navigation.navigate('RankFlow', { song: item })}    
                    />
                )}
                ListEmptyComponent={renderBody()}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.listContent}
            />
        </View>
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
        ...theme.type.body,
        color: theme.colors.text,
        textAlign: 'center',
    },
});