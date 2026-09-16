import React from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import theme from '../theme';
import { FRIENDS } from '../data/friends';
import { useLibrary } from '../state/LibraryContext';
import { compareTastes } from '../lib/compare';

export default function FriendsScreen({ navigation }) {
    const { entries } = useLibrary();

    return (
        <View style={styles.screen}>
            <FlatList
                data={FRIENDS}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                ListHeaderComponent={
                    <Text style={styles.caption}>
                        {entries.length < 5
                            ? 'Rank a few more songs — matches get meaningful around ten.'
                            : 'Tap someone to see how your taste lines up.'}
                    </Text>
                }
                renderItem={({ item }) => {
                    const match = compareTastes(entries, item.entries);
                    return (
                        <Pressable
                            onPress={() => navigation.navigate('FriendCompare', { friendId: item.id })}
                            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
                        >
                            <Text style={styles.avatar}>{item.avatar}</Text>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.name}>{item.name}</Text>
                                <Text style={styles.handle} numberOfLines={1}>
                                    {item.handle} · {item.entries.length} ranked
                                </Text>
                            </View>
                            <View style={styles.pill}>
                                <Text style={styles.pillText}>{match.score}%</Text>
                            </View>
                        </Pressable>
                    );
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: theme.colors.background },
    list: { padding: 16, gap: 10 },
    caption: { ...theme.type.small, marginBottom: 6 },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: theme.colors.card,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.lg,
        padding: 14,
    },
    rowPressed: { borderColor: theme.colors.brand },
    avatar: { fontSize: 28 },
    name: { fontSize: 16, fontWeight: '700', color: theme.colors.text },
    handle: { ...theme.type.small, marginTop: 2 },
    pill: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: theme.radius.pill,
        backgroundColor: theme.colors.brand,
    },
    pillText: { color: theme.colors.onBrand, fontWeight: '800' },
});