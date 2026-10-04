import { useTranslation } from '@/i18n';
import { StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { BrandLogo } from '@/components/BrandLogo';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { type ThemeColors, spacing } from '@/constants/theme';
import { useThemedStyles } from '@/hooks/useTheme';
import { usePreferencesStore } from '@/store/preferencesStore';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const { styles } = useThemedStyles(createStyles);
  const {
    unit,
    theme,
    language,
    setUnit: updateUnit,
    setTheme: updateTheme,
    setLanguage: updateLanguage,
  } = usePreferencesStore();

  return (
    <Screen
      title={t('Perfil')}
      subtitle={t('Personaliza tu experiencia. Los cambios se guardan en este dispositivo.')}
    >
      <Card>
        <Text style={styles.title}>{t('Idioma')}</Text>
        <Text style={styles.muted}>
          {' '}
          {t('Elige el idioma de la interfaz. Tus textos personalizados se conservan.')}{' '}
        </Text>
        <View style={styles.row}>
          <AppButton
            label="Español"
            variant={language === 'es' ? 'primary' : 'secondary'}
            onPress={() => updateLanguage('es')}
          />
          <AppButton
            label="English"
            variant={language === 'en' ? 'primary' : 'secondary'}
            onPress={() => updateLanguage('en')}
          />
        </View>
      </Card>

      <Card>
        <Text style={styles.title}>{t('Unidades')}</Text>
        <Text style={styles.muted}>
          {t('Los pesos se convierten automáticamente a la unidad elegida en toda la app.')}
        </Text>
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
        <Text style={styles.title}>{t('Tema')}</Text>
        <Text style={styles.muted}>
          {t('Elige un tema o sigue la apariencia de tu dispositivo.')}
        </Text>
        <View style={styles.row}>
          <AppButton
            label={t('Sistema')}
            variant={theme === 'system' ? 'primary' : 'secondary'}
            onPress={() => updateTheme('system')}
          />
          <AppButton
            label={t('Oscuro')}
            variant={theme === 'dark' ? 'primary' : 'secondary'}
            onPress={() => updateTheme('dark')}
          />
          <AppButton
            label={t('Claro')}
            variant={theme === 'light' ? 'primary' : 'secondary'}
            onPress={() => updateTheme('light')}
          />
        </View>
      </Card>

      <Card>
        <View style={styles.brandSection}>
          <BrandLogo variant="title" size={180} trimVerticalSpace />
          <Text style={styles.title}>LiftTrack MVP</Text>
          <Text style={[styles.muted, styles.brandDescription]}>
            {' '}
            {t(
              'Tus entrenamientos, siempre contigo. Registra tu progreso incluso sin conexión.',
            )}{' '}
          </Text>
        </View>
      </Card>
    </Screen>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    brandSection: {
      alignItems: 'center',
      gap: spacing.sm,
    },
    brandDescription: {
      textAlign: 'center',
    },
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
