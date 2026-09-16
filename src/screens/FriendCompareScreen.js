import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import theme from '../theme';
import ShareBar from '../components/ShareBar';
import ScoreBadge from '../components/ScoreBadge';
import { findFriend } from '../data/friends';
import { useLibrary } from '../state/LibraryContext';
import { compareTastes, WEIGHTS } from '../lib/compare';

const SIGNAL_LABELS = {
    genre: 'Genre mix',
    agreement: 'Score agreement',
    artist: 'Shared artists',
    catalog: 'Shared songs',
};

export default function FriendCompareScreen({ route }) {
    const friend = findFriend(route.params.friendId);
    const { entries } = useLibrary();

    if (!friend) {
        return (
            <View style={styles.center}>
                <Text style={theme.type.h3}>That profile is gone</Text>
            </View>
        );
    }

    const match = compareTastes(entries, friend.entries);

    return (
        <ScrollView style={styles.screen} contentContainerStyle={styles.pad}>
            <View style={styles.hero}>
                <Text style={styles.avatar}>{friend.avatar}</Text>
                <Text style={styles.score}>{match.score}%</Text>
                <Text style={styles.label}>{match.label}</Text>
                <Text style={styles.bio}>{friend.name} · {friend.bio}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>How that number is built</Text>
                {Object.keys(WEIGHTS).map((name) => {
                    const value = match.signals[name];
                    return (
                        <View key={name}>
                            <ShareBar
                                label={SIGNAL_LABELS[name]}
                                share={value === null ? 0 : value}
                                count={value === null ? '--' : `${Math.round(value * 100)}`}
                            />
                            {value === null ? (
                                <Text style={styles.note}>
                                    Not enough data — its {Math.round(WEIGHTS[name] * 100)}% was
                                    shared out among the others.
                                </Text>
                            ) : null}
                        </View>
                    );
                })}
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                    Songs you both ranked ({match.shared.length})
                </Text>
                {match.shared.length === 0 ? (
                    <Text style={styles.note}>Nothing in common yet.</Text>
                ) : (
                    match.shared.map((pair) => (
                        <View key={pair.key} style={styles.sharedRow}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.sharedTitle} numberOfLines={1}>
                                    {pair.mine.song.title}
                                </Text>
                                <Text style={styles.sharedArtist} numberOfLines={1}>
                                    {pair.mine.song.artist}
                                </Text>
                            </View>
                            <ScoreBadge score={pair.mine.score} sentiment={pair.mine.sentiment} />
                            <ScoreBadge score={pair.theirs.score} sentiment={pair.theirs.sentiment} />
                        </View>
                    ))
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: theme.colors.background },
    pad: { padding: 16, paddingBottom: 40 },
    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.background,
    },
    hero: { alignItems: 'center', paddingVertical: 20 },
    avatar: { fontSize: 44 },
    score: { fontSize: 48, fontWeight: '800', color: theme.colors.brand, marginTop: 4 },
    label: { ...theme.type.h3 },
    bio: { ...theme.type.small, textAlign: 'center', marginTop: 6 },
    section: {
        backgroundColor: theme.colors.card,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.lg,
        padding: 14,
        marginTop: 14,
    },
    sectionTitle: { ...theme.type.h3, marginBottom: 12 },
    note: { ...theme.type.small, marginBottom: 10 },
    sharedRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
    sharedTitle: { fontSize: 15, fontWeight: '700', color: theme.colors.text },
    sharedArtist: { ...theme.type.small, marginTop: 2 },
});