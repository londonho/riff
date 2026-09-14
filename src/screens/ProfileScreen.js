import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import theme from '../theme';
import ShareBar from '../components/ShareBar';
import { useLibrary } from '../state/LibraryContext';
import {
    SENTIMENTS,
    tasteProfile,
    topArtists,
    libraryStats,
} from '../lib/ranking';

export default function ProfileScreen() {
    const { entries } = useLibrary();

    const stats = libraryStats(entries);
    const genres = tasteProfile(entries, 6);
    const artists = topArtists(entries, 5);
    const mostArtist = artists.length ? artists[0].count : 1;

    if (entries.length === 0) {
        return (
            <View style={styles.empty}>
                <Text style={styles.emptyEmoji}>🎧</Text>
                <Text style={theme.type.h3}>No taste profile yet</Text>
                <Text style={styles.emptyText}>
                    Rank a few songs and this fills in on its own.
                </Text>
            </View>
        );
    }
    return (
        <ScrollView style={styles.screen} contentContainerStyle={styles.pad}>
                <View style={styles.statRow}>
                    <Stat value={stats.total} label="ranked" />
                    <Stat value={stats.avg.toFixed(1)} label="average" />
                    <Stat value={genres.length} label="genres" />
                </View>

                <Section title="How you rate">
                    {SENTIMENTS.map((s) => (
                        <ShareBar
                            key={s.key}
                            label={`${s.emoji}  ${s.short}`}
                            share={stats.buckets[s.key] / stats.total}
                            count={stats.buckets[s.key]}
                            color={s.color}
                        />
                    ))}
                </Section>

                <Section title="Your genres">
                    {genres.map((g) => (
                        <ShareBar
                            key={g.genre}
                            label={g.genre}
                            share={g.share}
                            count={g.count}
                        />
                    ))}
                </Section>

                <Section title="Most ranked artists">
                    {artists.map((a) => (
                        <ShareBar
                            key={a.artist}
                            label={a.artist}
                            share={a.count / mostArtist}
                            count={a.count}
                        />
                    ))}
                </Section>
            </ScrollView>
    );
}

function Stat({ value, label }) {
    return (
        <View style={styles.stat}>
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
        </View>
    );
}

function Section({ title, children }) {
    return (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>{title}</Text>
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    pad: {
        padding: 16,
        paddingBottom: 40,
    },
    statRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 18,
    },
    stat: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: theme.colors.card,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.lg,
        paddingVertical: 14,
    },
    statValue: {
        fontSize: 22,
        fontWeight: '800',
        color: theme.colors.brand,
    },
    statLabel: {
        ...theme.type.small,
        marginTop: 2,
    },
    section: {
        backgroundColor: theme.colors.card,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.lg,
        padding: 14,
        marginBottom: 14,
    },
    sectionTitle: {
        ...theme.type.h3,
        marginBottom: 12
    },
    empty: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
        gap: 8,
        backgroundColor: theme.colors.background,
    },
    emptyEmoji: {
        fontSize: 40,
    },
    emptyText: {
        ...theme.type.body,
        color: theme.colors.textMuted,
        textAlign: 'center',
    },
});