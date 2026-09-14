import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import theme from '../theme';

export default function ShareBar({ label, share, count, color = theme.colors.brand }) {
    const pct = Math.max(0, Math.min(1, share || 0));

    return (
        <View style={styles.row}>
            <Text style={styles.label} numberOfLines={1}>{label}</Text>
            <View style={styles.track}>
                <View style={[styles.fill, { width: `${pct * 100}%`, backgroundColor: color }]} />
            </View>
            <Text style={styles.count}>{count}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
    label: { ...theme.type.small, width: 92, color: theme.colors.text, fontWeight: '600' },
    track: {
        flex: 1,
        height: 10,
        borderRadius: theme.radius.pill,
        backgroundColor: theme.colors.background,
        overflow: 'hidden',
    },
    fill: { height: '100%', borderRadius: theme.radius.pill },
    count: { ...theme.type.small, width: 26, textAlign: 'right', fontWeight: '700' },
});