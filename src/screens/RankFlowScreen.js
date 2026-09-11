import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/Button';
import theme from '../theme';
import {
    SENTIMENTS,
    CHOICE,
    createSession,
    answer,
    undo,
    bucketOf,
} from '../lib/ranking';

export default function RankFlowScreen({ song, entries, onDone, onCancel }) {
    const [step, setStep] = useState('sentiment');
    const [session, setSession] = useState(null);

    function chooseSentiment(key) {
        const bucket = bucketOf(entries, key);
        const next = createSession(song, key, bucket);
        setSession(next);
        if (next.finished) {
            onDone(key, next.insertIndex);
        } else {
            setStep('compare');
        }
    }
    function respond(choice) {
        const next = answer(session, choice);
        setSession(next);
        if (next.finished) onDone(next.sentiment, next.insertIndex);
    }

    function goBack() {
        if (!session || session.history.length === 0) {
            setStep('sentiment');
            setSession(null);
            return;
        }
        setSession(undo(session));
    }
    return (
        <SafeAreaView style={styles.screen}>
            <View style={styles.topBar}>
                <Pressable onPress={onCancel} hitSlop={12}>
                    <Text style={styles.cancel}>Cancel</Text>
                </Pressable>
                <Text style={styles.topTitle}>Rank song</Text>
                <View style={{ width: 54 }} />
            </View>

            {step === 'sentiment' ? (
                <SentimentStep song={song} onChoose={chooseSentiment} />
            ) : null}

            {step === 'compare' && session && session.opponent ? (
                <CompareStep session={session} onRespond={respond} onBack={goBack} />
            ) : null}
        </SafeAreaView>
    );
}

function SentimentStep({ song, onChoose }) {
    return (
        <ScrollView contentContainerStyle={styles.pad}>
            <View style={styles.hero}>
                <Text style={styles.heroTitle} numberOfLines={2}>{song.title}</Text>
                <Text style={styles.heroArtist} numberOfLines={1}>{song.artist}</Text>
                <Text style={styles.heroAlbum} numberOfLines={1}>{song.album}</Text>
            </View>

            <Text style={styles.question}>What did you think?</Text>

            {SENTIMENTS.map((s) => (
                <Pressable
                    key={s.key}
                    onPress={() => onChoose(s.key)}
                    style={({ pressed }) => [
                        styles.sentimentCard,
                        { backgroundColor: s.soft, borderColor: pressed ? s.color : 'transparent' },
                    ]}
                >
                    <Text style={styles.emoji}>{s.emoji}</Text>
                    <Text style={[styles.sentimentLabel, { color: s.color }]}>{s.label}</Text>
                </Pressable>
            ))}
        </ScrollView>
    );
}

function CompareStep({ session, onRespond, onBack }) {
    const total = Math.max(session.total, session.asked + 1);

    return (
        <View style={styles.compare}>
            <Text style={styles.progress}>
                Question {session.asked + 1} of about {total}
            </Text>

            <Text style={styles.question}>Which do you prefer?</Text>

            <ChoiceCard
                song={session.song}
                badge="NEW"
                onPress={() => onRespond(CHOICE.NEW)}
            />

            <View style={styles.orRow}>
                <View style={styles.orLine} />
                <Text style={styles.orText}>OR</Text>
                <View style={styles.orLine} />
            </View>

            <ChoiceCard
                song={session.opponent.song}
                score={session.opponent.score}
                onPress={() => onRespond(CHOICE.EXISTING)}
            />

            <Button
                title="Too close to call"
                variant="secondary"
                onPress={() => onRespond(CHOICE.TIE)}
                style={{ marginTop: 20 }}
            />

            <Pressable onPress={onBack} style={styles.undo}>
                <Text style={styles.undoText}>Undo last answer</Text>
            </Pressable>
        </View>
    );
}

function ChoiceCard({ song, score, badge, onPress }) {
    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [styles.choice, pressed && styles.choicePressed]}
        >
            <View style={{ flex: 1 }}>
                <Text style={styles.choiceTitle} numberOfLines={2}>{song.title}</Text>
                <Text style={styles.choiceArtist} numberOfLines={1}>{song.artist}</Text>
            </View>

            {typeof score === 'number' ? (
                <Text style={styles.choiceScore}>{score.toFixed(1)}</Text>
            ) : badge ? (
                <Text style={styles.newBadge}>{badge}</Text>
            ) : null}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: theme.colors.background },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    cancel: { ...theme.type.body, color: theme.colors.brand, width: 54 },
    topTitle: { ...theme.type.h3 },
    pad: { paddingHorizontal: 20, paddingBottom: 40 },

    hero: { alignItems: 'center', paddingVertical: 20 },
    heroTitle: { ...theme.type.h1, fontSize: 24, textAlign: 'center' },
    heroArtist: { ...theme.type.body, marginTop: 6 },
    heroAlbum: { ...theme.type.small, marginTop: 2 },

    question: { ...theme.type.h2, textAlign: 'center', marginVertical: 16 },

    sentimentCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 18,
        borderRadius: theme.radius.lg,
        borderWidth: 2,
        marginBottom: 10,
    },
    emoji: { fontSize: 24 },
    sentimentLabel: { fontSize: 17, fontWeight: '700' },

    compare: { flex: 1, paddingHorizontal: 20 },
    progress: { ...theme.type.small, textAlign: 'center', marginTop: 4 },

    choice: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.card,
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        borderColor: theme.colors.border,
        padding: 18,
    },
    choicePressed: { borderColor: theme.colors.brand },
    choiceTitle: { fontSize: 17, fontWeight: '700', color: theme.colors.text },
    choiceArtist: { ...theme.type.body, marginTop: 4 },
    choiceScore: { fontSize: 20, fontWeight: '800', color: theme.colors.brand },
    newBadge: {
        fontSize: 11,
        fontWeight: '800',
        color: theme.colors.brand,
        letterSpacing: 1,
    },

    orRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 16 },
    orLine: { flex: 1, height: 1, backgroundColor: theme.colors.border },
    orText: { ...theme.type.small, fontWeight: '800' },

    undo: { alignItems: 'center', paddingVertical: 18 },
    undoText: { ...theme.type.small, textDecorationLine: 'underline' },
});