import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import theme from '../theme';

export default function SongCard({ title, artist, album, onPress }) {
    return (
        <Pressable onPress={onPress} style={styles.card}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.artist}>{artist}</Text>
            <Text style={styles.album}>{album}</Text>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: theme.colors.background,
        borderWidth: 5,
        borderColor: theme.colors.border,
        padding: 10,
        margin: 10,
        borderRadius: theme.radius.md,
    },
    title: {
        ...theme.type.h3
    },
    artist: {
        ...theme.type.body
    },
    album: {
        ...theme.type.small
    },
});