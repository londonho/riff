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
import HomeScreen from './src/screens/HomeScreen';
import { LibraryProvider } from './src/state/LibraryContext';

export default function App() {
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <LibraryProvider>
        <HomeScreen />
      </LibraryProvider>
      <StatusBar style="auto" />    
    </SafeAreaProvider>
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
