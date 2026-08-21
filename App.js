import { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import SongCard from './src/components/SongCard';

export default function App() {
  const [tapCount, setTapCount] = useState(0);

  useEffect(() => {
    console.log(`Tap count: ${tapCount}`);
  }, [tapCount]);

  return (
    <View style={styles.container}>
      <Text>London</Text>
      {[
        { title: 'Song 1', artist: 'Artist 1', album: 'Album 1' },
        { title: 'Song 2', artist: 'Artist 2', album: 'Album 2' },
        { title: 'Song 3', artist: 'Artist 3', album: 'Album 3' },
      ].map((song, index) => (
        <SongCard 
          key={index} 
          title={song.title} 
          artist={song.artist} 
          album={song.album}
          onPress={() => setTapCount((count) => count + 1)} />
      ))}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
