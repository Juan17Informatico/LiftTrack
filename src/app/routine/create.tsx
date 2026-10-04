import { useTranslation } from '@/i18n';
import { dialogs } from '@/store/dialogStore';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { Save } from 'lucide-react-native';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, Text } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { Card } from '@/components/Card';
import { FormTextInput } from '@/components/FormTextInput';
import { Screen } from '@/components/Screen';
import { type ThemeColors } from '@/constants/theme';
import { useThemedStyles } from '@/hooks/useTheme';
import { useRepositories } from '@/hooks/useRepositories';
import { routineFormSchema, type RoutineFormInput } from '@/schemas/routineSchemas';
import { getErrorMessage } from '@/utils/errors';

export default function CreateRoutineScreen() {
  const { t } = useTranslation();
  const { colors, styles } = useThemedStyles(createStyles);
  const { routines } = useRepositories();
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
  } = useForm<RoutineFormInput>({
    resolver: zodResolver(routineFormSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const onSubmit = handleSubmit(async (input) => {
    try {
      const routine = await routines.create(input);
      router.replace({ pathname: '/routine/[id]', params: { id: routine.id } });
    } catch (error) {
      dialogs.alert(t('No se pudo crear la rutina'), getErrorMessage(error));
    }
  });

  return (
    <Screen
      title={t('Crear rutina')}
      subtitle={t('Ponle nombre al plan y luego agrega ejercicios del catalogo.')}
    >
      <Card>
        <Controller
          control={control}
          name="name"
          render={({ field: { onBlur, onChange, value } }) => (
            <FormTextInput
              autoFocus
              error={errors.name?.message}
              label={t('Nombre')}
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder={t('Dia de empuje')}
              value={value}
            />
          )}
        />
        <Controller
          control={control}
          name="description"
          render={({ field: { onBlur, onChange, value } }) => (
            <FormTextInput
              error={errors.description?.message}
              label={t('Descripcion')}
              multiline
              numberOfLines={3}
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder={t('Pecho, hombros, triceps')}
              style={styles.textArea}
              value={value}
            />
          )}
        />
        <AppButton
          disabled={isSubmitting}
          icon={<Save color={colors.ink} size={18} />}
          label={isSubmitting ? t('Guardando') : t('Guardar rutina')}
          onPress={onSubmit}
        />
      </Card>
      <Text style={styles.note}>{t('Los ejercicios se agregan en la siguiente pantalla.')}</Text>
    </Screen>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    textArea: {
      minHeight: 96,
      textAlignVertical: 'top',
    },
    note: {
      color: colors.textMuted,
      fontSize: 13,
      lineHeight: 19,
    },
  });
