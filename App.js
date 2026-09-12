import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import SearchScreen from './src/screens/SearchScreen';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import YourListScreen from './src/screens/YourListScreen';
import SongCard from './src/components/SongCard';
import theme from './src/theme';
import Button from './src/components/Button';
import RankFlowScreen from './src/screens/RankFlowScreen';
import { insertEntry } from './src/lib/ranking';

export default function App() {
  const [entries, setEntries] = useState([]);
  const [screen, setScreen] = useState('search');
  const [pendingSong, setPendingSong] = useState(null);

  function startRanking(song) {
      setPendingSong(song);
      setScreen('rank');
  }

  function finishRanking(sentiment, insertIndex) {
      const entry = {
          id: `e_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          song: pendingSong,
          sentiment,
          addedAt: new Date().toISOString(),
      };

      setEntries((current) => insertEntry(current, entry, insertIndex));
      setPendingSong(null);
      setScreen('list');
  }

  function cancelRanking() {
      setPendingSong(null);
      setScreen('search');
  }
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
            <View style={styles.root}>
                {screen === 'search' ? <SearchScreen onSelectSong={startRanking} /> : null}

                {screen === 'rank' && pendingSong ? (
                    <RankFlowScreen
                        song={pendingSong}
                        entries={entries}
                        onDone={finishRanking}
                        onCancel={cancelRanking}
                    />
                ) : null}

                {screen === 'list' ? <YourListScreen entries={entries} /> : null}

                {screen !== 'rank' ? (
                    <View style={styles.tabs}>
                        <Tab
                            label="Search"
                            active={screen === 'search'}
                            onPress={() => setScreen('search')}
                        />
                        <Tab
                            label={`Your list (${entries.length})`}
                            active={screen === 'list'}
                            onPress={() => setScreen('list')}
                        />
                    </View>
                ) : null}
            </View>
            <StatusBar style="auto" />
        </SafeAreaProvider>
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
  root: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  tabs: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.card,
    paddingBottom: 20,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  tabText: {
    ...theme.type.body,
    color: theme.colors.textMuted,
    fontWeight: '600',
  },
  tabTextActive: {
    color: theme.colors.brand,
    fontWeight: '800',
  }
});
