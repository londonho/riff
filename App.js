import { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import SearchScreen from './src/screens/SearchScreen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import SongCard from './src/components/SongCard';
import theme from './src/theme';
import Button from './src/components/Button';
import RankFlowScreen from './src/screens/RankFlowScreen';

export default function App() {
  return (
    <SafeAreaProvider>
      <RankFlowScreen
        song={{ id: '1', title: 'Test Song', artist: 'Test Artist', album: 'Test Album' }}
        entries={[]}
        onDone={(sentiment, index) => console.log('DONE', sentiment, index)}
        onCancel={() => console.log('CANCEL')}
      />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
});
