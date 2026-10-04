import { useTranslation } from '@/i18n';
import type { SQLiteDatabase } from 'expo-sqlite';
import { SQLiteProvider } from 'expo-sqlite';
import { PropsWithChildren, useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { LoadingState } from '@/components/LoadingState';
import { BrandLogo } from '@/components/BrandLogo';
import { type ThemeColors, spacing } from '@/constants/theme';
import { useThemedStyles } from '@/hooks/useTheme';
import { DatabaseBootstrap } from '@/database/DatabaseBootstrap';
import { DATABASE_NAME, initializeDatabase } from '@/database/database';
import { getErrorMessage } from '@/utils/errors';

type DatabaseStatus =
  { state: 'loading' } | { state: 'ready' } | { state: 'error'; message: string };

export function DatabaseProvider({ children }: PropsWithChildren) {
  const { t } = useTranslation();
  const { styles } = useThemedStyles(createStyles);
  const [status, setStatus] = useState<DatabaseStatus>({ state: 'loading' });

  const handleInit = useCallback(async (db: SQLiteDatabase) => {
    setStatus({ state: 'loading' });

    try {
      await initializeDatabase(db);
      setStatus({ state: 'ready' });
    } catch (error) {
      console.error('Database initialization failed', error);
      setStatus({ state: 'error', message: getErrorMessage(error) });
    }
  }, []);

  const handleProviderError = useCallback((error: Error) => {
    console.error('SQLite provider failed', error);
    setStatus({ state: 'error', message: getErrorMessage(error) });
  }, []);

  return (
    <View style={styles.root}>
      {status.state === 'loading' ? (
        <View style={styles.overlay}>
          <BrandLogo variant="title" />
          <LoadingState label={t('Preparando LiftTrack')} />
        </View>
      ) : null}
      {status.state === 'error' ? (
        <View style={styles.overlay}>
          <Text style={styles.title}>{t('No se pudo iniciar la base de datos')}</Text>
          <Text style={styles.message}>{t(status.message)}</Text>
        </View>
      ) : null}
      <SQLiteProvider
        databaseName={DATABASE_NAME}
        onError={handleProviderError}
        onInit={handleInit}
      >
        <DatabaseBootstrap>{children}</DatabaseBootstrap>
      </SQLiteProvider>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    root: {
      backgroundColor: colors.background,
      flex: 1,
      minHeight: '100%',
    },
    overlay: {
      backgroundColor: colors.background,
      bottom: 0,
      justifyContent: 'center',
      left: 0,
      padding: spacing.xl,
      position: 'absolute',
      right: 0,
      top: 0,
      zIndex: 10,
    },
    title: {
      color: colors.text,
      fontSize: 20,
      fontWeight: '800',
      marginBottom: spacing.sm,
      textAlign: 'center',
    },
    message: {
      color: colors.textMuted,
      fontSize: 14,
      lineHeight: 21,
      textAlign: 'center',
    },
  });
