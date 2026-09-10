import { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import SearchScreen from './src/screens/SearchScreen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import SongCard from './src/components/SongCard';
import theme from './src/theme';
import Button from './src/components/Button';

export default function App() {
  const [tapCount, setTapCount] = useState(0);

  useEffect(() => {
    console.log(`Tap count: ${tapCount}`);
  }, [tapCount]);

  return (
    <SafeAreaProvider>
      <SearchScreen />
      <StatusBar style="auto" />
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
