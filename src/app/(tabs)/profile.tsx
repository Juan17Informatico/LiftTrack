import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { colors, spacing } from '@/constants/theme';
import { preferences, type AppLanguage, type ThemePreference } from '@/services/preferences';
import type { WeightUnit } from '@/types/domain';

export default function ProfileScreen() {
  const [unit, setUnit] = useState<WeightUnit>(preferences.getWeightUnit());
  const [theme, setTheme] = useState<ThemePreference>(preferences.getThemePreference());
  const [language, setLanguage] = useState<AppLanguage>(preferences.getAppLanguage());

  function updateUnit(nextUnit: WeightUnit) {
    preferences.setWeightUnit(nextUnit);
    setUnit(nextUnit);
  }

  function updateTheme(nextTheme: ThemePreference) {
    preferences.setThemePreference(nextTheme);
    setTheme(nextTheme);
  }

  function updateLanguage(nextLanguage: AppLanguage) {
    preferences.setAppLanguage(nextLanguage);
    setLanguage(nextLanguage);
  }

  return (
    <Screen title="Perfil" subtitle="Preferencias locales para el MVP offline.">
      <Card>
        <Text style={styles.title}>Idioma</Text>
        <Text style={styles.muted}>
          La interfaz se muestra en espanol. Los nombres de ejercicios se conservan mayormente en
          ingles.
        </Text>
        <View style={styles.row}>
          <AppButton
            label="Espanol"
            variant={language === 'es' ? 'primary' : 'secondary'}
            onPress={() => updateLanguage('es')}
          />
        </View>
      </Card>

      <Card>
        <Text style={styles.title}>Unidades</Text>
        <Text style={styles.muted}>Los pesos se guardan como numeros. La unidad visible es una preferencia.</Text>
        <View style={styles.row}>
          <AppButton
            label="kg"
            variant={unit === 'kg' ? 'primary' : 'secondary'}
            onPress={() => updateUnit('kg')}
          />
          <AppButton
            label="lb"
            variant={unit === 'lb' ? 'primary' : 'secondary'}
            onPress={() => updateUnit('lb')}
          />
        </View>
      </Card>

      <Card>
        <Text style={styles.title}>Tema</Text>
        <Text style={styles.muted}>La primera version visual esta optimizada para modo oscuro.</Text>
        <View style={styles.row}>
          <AppButton
            label="Sistema"
            variant={theme === 'system' ? 'primary' : 'secondary'}
            onPress={() => updateTheme('system')}
          />
          <AppButton
            label="Oscuro"
            variant={theme === 'dark' ? 'primary' : 'secondary'}
            onPress={() => updateTheme('dark')}
          />
          <AppButton
            label="Claro"
            variant={theme === 'light' ? 'primary' : 'secondary'}
            onPress={() => updateTheme('light')}
          />
        </View>
      </Card>

      <Card>
        <Text style={styles.title}>LiftTrack MVP</Text>
        <Text style={styles.muted}>
          Datos local-first, persistencia SQLite, capa de repositories y UUIDs preparados para
          sincronizacion futura con Supabase.
        </Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
  },
  muted: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
});
