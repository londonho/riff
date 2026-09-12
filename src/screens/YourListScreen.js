import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScoreBadge from '../components/ScoreBadge';
import theme from '../theme';
import { libraryStats } from '../lib/ranking';
import { useLibrary } from '../state/LibraryContext';

export default function YourListScreen() {
    const { entries } = useLibrary();
    const stats = libraryStats(entries);

    return (
        <SafeAreaView style={styles.screen}>
            <View style={styles.header}>
                <Text style={theme.type.h1}>Your list</Text>
                <Text style={styles.stats}>
                    {stats.total} ranked · avg {stats.total ? stats.avg.toFixed(1) : '--'}
                </Text>
            </View>

            <FlatList
                data={entries}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                renderItem={({ item }) => (
                    <View style={styles.row}>
                        <Text style={styles.rank}>{item.rank}</Text>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.title} numberOfLines={1}>{item.song.title}</Text>
                            <Text style={styles.artist} numberOfLines={1}>
                                {item.song.artist} · {item.song.album}
                            </Text>
                        </View>
                        <ScoreBadge score={item.score} sentiment={item.sentiment} />
                    </View>
                )}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Text style={styles.emptyText}>
                            Nothing ranked yet. Search for a song and add it.
                        </Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: theme.colors.background },
    header: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
    stats: { ...theme.type.small, marginTop: 2 },
    list: { paddingBottom: 40, flexGrow: 1 },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: theme.colors.card,
        borderRadius: theme.radius.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
        marginHorizontal: 16,
        marginBottom: 8,
        padding: 12,
    },
    rank: { ...theme.type.small, width: 24, textAlign: 'center', fontWeight: '800' },
    title: { fontSize: 15.5, fontWeight: '700', color: theme.colors.text },
    artist: { ...theme.type.small, marginTop: 2 },
    empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
    emptyText: { ...theme.type.body, color: theme.colors.textMuted, textAlign: 'center' },
});