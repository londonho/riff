import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getSentiment } from '../lib/ranking';
import theme from '../theme';

export default function ScoreBadge({ score, sentiment }) {
    const band = getSentiment(sentiment);

    return (
        <View style={[styles.badge, { backgroundColor: band.color }]}>
            <Text style={styles.text}>{score.toFixed(1)}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    badge: {
        minWidth: 44,
        height: 44,
        borderRadius: theme.radius.md,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 6,
    },
    text: { color: theme.colors.onBrand, fontWeight: '800', fontSize: 16 },
});