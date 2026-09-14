import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import theme from './src/theme';
import { LibraryProvider } from './src/state/LibraryContext';
import RootNavigator from './src/navigation/RootNavigator';
import ErrorBoundary from './src/components/ErrorBoundary';

export default function App() {
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <ErrorBoundary>
        <LibraryProvider>
          <RootNavigator />
        </LibraryProvider>
      </ErrorBoundary>
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
