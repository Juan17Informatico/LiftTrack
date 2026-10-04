import { useTranslation } from '@/i18n';
import { Check, Trash2 } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { IconButton } from '@/components/IconButton';
import { type ThemeColors, radius, spacing } from '@/constants/theme';
import { useThemedStyles } from '@/hooks/useTheme';
import { useWeight } from '@/hooks/useWeight';
import { toStoredWeight, weightInput } from '@/utils/weight';
import type { WeightUnit, WorkoutSet } from '@/types/domain';
import type { UpdateWorkoutSetInput } from '@/database/repositories/workoutRepository';
import { dialogs } from '@/store/dialogStore';
import { getErrorMessage } from '@/utils/errors';

interface WorkoutSetRowProps {
  set: WorkoutSet;
  onDelete: (setId: string) => Promise<void>;
  onUpdate: (setId: string, input: UpdateWorkoutSetInput) => Promise<void>;
}

export function WorkoutSetRow({ set, onDelete, onUpdate }: WorkoutSetRowProps) {
  const { t } = useTranslation();
  const { colors, styles } = useThemedStyles(createStyles);
  const { unit } = useWeight();
  // Keep the unit alongside the draft so switching preferences cannot reinterpret input.
  const [draft, setDraft] = useState<{ text: string; unit: WeightUnit } | null>(null);
  const draftValue = draft?.text.trim() ? Number(draft.text.replace(',', '.')) : null;
  const weight =
    draft === null
      ? weightInput(set.weight, unit)
      : draft.unit === unit
        ? draft.text
        : weightInput(draftValue === null ? null : toStoredWeight(draftValue, draft.unit), unit);
  const [repetitions, setRepetitions] = useState(set.repetitions?.toString() ?? '');
  const [saving, setSaving] = useState(false);

  async function save(completed = set.completed) {
    setSaving(true);
    try {
      const input = parseSetInput(draft?.text ?? '', repetitions, completed);
      input.weight =
        draft === null
          ? set.weight
          : input.weight === null
            ? null
            : toStoredWeight(input.weight, draft.unit);
      await onUpdate(set.id, input);
      setDraft(null);
    } catch (error) {
      dialogs.alert(t('No se pudo guardar la serie'), getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  async function toggleCompleted() {
    await save(!set.completed);
  }

  return (
    <View style={[styles.row, set.completed && styles.completedRow]}>
      <Text style={styles.number}>{set.setNumber}</Text>
      <TextInput
        editable={!saving}
        keyboardType="decimal-pad"
        onBlur={() => save()}
        onChangeText={(text) => setDraft({ text, unit })}
        accessibilityLabel={t('Peso ({{unit}})', { unit })}
        placeholder={unit}
        placeholderTextColor={colors.textMuted}
        selectionColor={colors.primary}
        style={styles.input}
        value={weight}
      />
      <TextInput
        editable={!saving}
        keyboardType="number-pad"
        onBlur={() => save()}
        onChangeText={setRepetitions}
        placeholder="reps"
        accessibilityLabel={t('Reps')}
        placeholderTextColor={colors.textMuted}
        selectionColor={colors.primary}
        style={styles.input}
        value={repetitions}
      />
      <IconButton
        accessibilityLabel={
          set.completed ? t('Marcar serie incompleta') : t('Marcar serie completa')
        }
        icon={<Check color={set.completed ? colors.success : colors.text} size={18} />}
        onPress={toggleCompleted}
        disabled={saving}
      />
      <IconButton
        accessibilityLabel={t('Eliminar serie')}
        danger
        icon={<Trash2 color={colors.danger} size={18} />}
        onPress={() => onDelete(set.id)}
        disabled={saving}
      />
    </View>
  );
}

function parseSetInput(
  weight: string,
  repetitions: string,
  completed: boolean,
): UpdateWorkoutSetInput {
  const parsedWeight = Number(weight.replace(',', '.'));
  const parsedRepetitions = Number(repetitions);

  if (
    (weight.trim() !== '' && (!Number.isFinite(parsedWeight) || parsedWeight < 0)) ||
    (repetitions.trim() !== '' && (!Number.isInteger(parsedRepetitions) || parsedRepetitions <= 0))
  ) {
    throw new Error(
      'El peso debe ser un número positivo o cero y las repeticiones un entero positivo.',
    );
  }

  return {
    weight: Number.isFinite(parsedWeight) && weight.trim() !== '' ? parsedWeight : null,
    repetitions:
      Number.isInteger(parsedRepetitions) && repetitions.trim() !== '' ? parsedRepetitions : null,
    completed,
  };
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    row: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: spacing.sm,
    },
    completedRow: {
      opacity: 0.82,
    },
    number: {
      color: colors.textMuted,
      fontSize: 14,
      fontWeight: '800',
      textAlign: 'center',
      width: 24,
    },
    input: {
      backgroundColor: colors.surfaceMuted,
      borderColor: colors.border,
      borderRadius: radius.md,
      borderWidth: 1,
      color: colors.text,
      flex: 1,
      fontSize: 16,
      minHeight: 40,
      paddingHorizontal: spacing.sm,
    },
  });
