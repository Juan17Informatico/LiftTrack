import { useTranslation } from '@/i18n';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import * as SystemUI from 'expo-system-ui';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { type ThemeColors } from '@/constants/theme';
import { useThemedStyles } from '@/hooks/useTheme';
import { DatabaseProvider } from '@/database/DatabaseProvider';
import { AppDialog } from '@/components/AppDialog';
import { AppButton } from '@/components/AppButton';
import { EmptyState } from '@/components/EmptyState';
import { LoadingState } from '@/components/LoadingState';
import { usePreferencesStore } from '@/store/preferencesStore';

const queryClient = new QueryClient();

export default function RootLayout() {
  const { t } = useTranslation();
  const { colors, styles, dark } = useThemedStyles(createStyles);
  const navigationTheme = useMemo(() => {
    const base = dark ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: colors.primary,
        background: colors.background,
        card: colors.background,
        text: colors.text,
        border: colors.border,
        notification: colors.danger,
      },
    };
  }, [colors, dark]);
  const hydrated = usePreferencesStore((state) => state.hydrated);
  const hydrate = usePreferencesStore((state) => state.hydrate);
  const [preferenceError, setPreferenceError] = useState(false);
  useEffect(() => {
    void hydrate().catch(() => setPreferenceError(true));
  }, [hydrate]);
  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(colors.background).catch(console.error);
  }, [colors.background]);
  if (!hydrated) {
    return (
      <GestureHandlerRootView style={styles.root}>
        <StatusBar style={dark ? 'light' : 'dark'} />
        {preferenceError ? (
          <EmptyState
            title={t('No se pudieron cargar las preferencias')}
            message={t('Intenta de nuevo. Tus datos se conservan.')}
            action={
              <AppButton
                label={t('Reintentar')}
                onPress={() => {
                  setPreferenceError(false);
                  void hydrate().catch(() => setPreferenceError(true));
                }}
              />
            }
          />
        ) : (
          <LoadingState label={t('Preparando LiftTrack')} />
        )}
      </GestureHandlerRootView>
    );
  }
  return (
    <GestureHandlerRootView style={styles.root}>
      <StatusBar style={dark ? 'light' : 'dark'} />
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider style={styles.root}>
          <ThemeProvider value={navigationTheme}>
            <DatabaseProvider>
              <Stack
                screenOptions={{
                  headerStyle: { backgroundColor: colors.background },
                  headerTintColor: colors.text,
                  headerTitleStyle: { fontWeight: '800' },
                  headerShadowVisible: false,
                  statusBarStyle: dark ? 'light' : 'dark',
                  contentStyle: { backgroundColor: colors.background },
                }}
              >
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="routine/create" options={{ title: t('Crear rutina') }} />
                <Stack.Screen name="routine/[id]" options={{ title: t('Rutina') }} />
                <Stack.Screen
                  name="workout/active"
                  options={{ title: t('Entrenamiento activo') }}
                />
                <Stack.Screen name="workout/[id]" options={{ title: t('Entrenamiento') }} />
                <Stack.Screen name="exercise/[id]" options={{ title: t('Ejercicio') }} />
                <Stack.Screen name="exercise/create" options={{ title: t('Nuevo ejercicio') }} />
                <Stack.Screen name="exercise/edit" options={{ title: t('Editar ejercicio') }} />
              </Stack>
            </DatabaseProvider>
            <AppDialog />
          </ThemeProvider>
        </SafeAreaProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    root: {
      backgroundColor: colors.background,
      flex: 1,
      minHeight: '100%',
    },
  });
