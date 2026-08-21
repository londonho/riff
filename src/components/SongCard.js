import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

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
        backgroundColor: '#fbd1d1',
        padding: 10,
        margin: 10,
        borderRadius: 5,
        rounded: 10,
    },
    title: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    artist: {
        fontSize: 14,
        color: '#666',
    },
    album: {
        fontSize: 12,
        color: '#999',
    },
});