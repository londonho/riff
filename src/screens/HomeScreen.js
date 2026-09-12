import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import SearchScreen from './SearchScreen';
import YourListScreen from './YourListScreen';
import RankFlowScreen from './RankFlowScreen';
import theme from '../theme';
import { useLibrary } from '../state/LibraryContext';

export default function HomeScreen() {
    const { entries } = useLibrary();
    const [screen, setScreen] = useState('search');
    const [pendingSong, setPendingSong] = useState(null);

    function startRanking(song) {
        setPendingSong(song);
        setScreen('rank');
    }

    function finishRanking() {
        setPendingSong(null);
        setScreen('list');
    }

    function cancelRanking() {
        setPendingSong(null);
        setScreen('search');
    }

    return (
        <View style={styles.root}>
            {screen === 'search' ? <SearchScreen onSelectSong={startRanking} /> : null}

            {screen === 'rank' && pendingSong ? (
                <RankFlowScreen
                    song={pendingSong}
                    onDone={finishRanking}
                    onCancel={cancelRanking}
                />
            ) : null}

            {screen === 'list' ? <YourListScreen /> : null}

            {screen !== 'rank' ? (
                <View style={styles.tabs}>
                    <Tab label="Search" active={screen === 'search'} onPress={() => setScreen('search')} />
                    <Tab label={`Your list (${entries.length})`} active={screen === 'list'} onPress={() => setScreen('list')} />
                </View>
            ) : null}
        </View>
    );
}

function Tab({ label, active, onPress }) {
    return (
        <Pressable onPress={onPress} style={styles.tab}>
            <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: theme.colors.background },
    tabs: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
        backgroundColor: theme.colors.card,
        paddingBottom: 20,
    },
    tab: { flex: 1, alignItems: 'center', paddingVertical: 12 },
    tabText: { ...theme.type.body, color: theme.colors.textMuted, fontWeight: '600' },
    tabTextActive: { color: theme.colors.brand, fontWeight: '800' },
});