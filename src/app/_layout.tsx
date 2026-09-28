import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { colors } from '@/constants/theme';
import { DatabaseProvider } from '@/database/DatabaseProvider';

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <StatusBar style="light" />
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider style={styles.root}>
          <DatabaseProvider>
            <Stack
              screenOptions={{
                headerStyle: { backgroundColor: colors.background },
                headerTintColor: colors.text,
                headerTitleStyle: { fontWeight: '800' },
                contentStyle: { backgroundColor: colors.background },
              }}
            >
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="routine/create" options={{ title: 'Crear rutina' }} />
              <Stack.Screen name="routine/[id]" options={{ title: 'Rutina' }} />
              <Stack.Screen name="workout/active" options={{ title: 'Entrenamiento activo' }} />
              <Stack.Screen name="workout/[id]" options={{ title: 'Entrenamiento' }} />
              <Stack.Screen name="exercise/[id]" options={{ title: 'Ejercicio' }} />
            </Stack>
          </DatabaseProvider>
        </SafeAreaProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.background,
    flex: 1,
    minHeight: '100%',
  },
});
