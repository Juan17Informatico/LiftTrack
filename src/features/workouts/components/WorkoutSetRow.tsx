import { useTranslation } from '@/i18n';
import { Trash2 } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
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
  timed: boolean;
  set: WorkoutSet;
  onDelete: (setId: string) => Promise<void>;
  onUpdate: (setId: string, input: UpdateWorkoutSetInput) => Promise<void>;
  registerSave?: (setId: string, save: (() => Promise<void>) | null) => void;
}

export function WorkoutSetRow({
  set,
  timed,
  onDelete,
  onUpdate,
  registerSave,
}: WorkoutSetRowProps) {
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
  const [minutes, setMinutes] = useState(
    set.durationSeconds === null ? '' : String(set.durationSeconds / 60),
  );
  const values = useRef({ draft, repetitions, minutes });
  const storedWeight = useRef(set.weight);
  const pending = useRef<Promise<void>>(Promise.resolve());
  const saveRef = useRef<() => Promise<void>>(() => Promise.resolve());

  function save(): Promise<void> {
    const snapshot = { ...values.current };
    const operation = pending.current
      .catch(() => {})
      .then(async () => {
        if (timed) {
          const value = Number(snapshot.minutes.trim());
          if (
            snapshot.minutes.trim() &&
            (!Number.isSafeInteger(value * 60) || !Number.isInteger(value) || value <= 0)
          ) {
            throw new Error(t('Ingresa los minutos como un número entero positivo.'));
          }
          await onUpdate(set.id, {
            completed: snapshot.minutes.trim() !== '',
            weight: null,
            repetitions: null,
            durationSeconds: snapshot.minutes.trim() ? value * 60 : null,
          });
          return;
        }
        const input = parseSetInput(snapshot.draft?.text ?? '', snapshot.repetitions);
        input.weight =
          snapshot.draft === null
            ? storedWeight.current
            : input.weight === null
              ? null
              : toStoredWeight(input.weight, snapshot.draft.unit);
        await onUpdate(set.id, input);
        storedWeight.current = input.weight;
      });
    pending.current = operation;
    return operation;
  }
  saveRef.current = save;

  useEffect(() => {
    registerSave?.(set.id, () => saveRef.current());
    return () => registerSave?.(set.id, null);
  }, [registerSave, set.id]);

  function saveOnBlur() {
    void save().catch((error) => {
      dialogs.alert(t('No se pudo guardar la serie'), getErrorMessage(error));
    });
  }

  return (
    <View style={styles.row}>
      <Text style={styles.number}>{set.setNumber}</Text>
      {timed ? (
        <TextInput
          keyboardType="number-pad"
          accessibilityLabel={t('Minutos')}
          placeholder="min"
          placeholderTextColor={colors.textMuted}
          selectionColor={colors.primary}
          style={styles.input}
          value={minutes}
          onChangeText={(text) => {
            values.current.minutes = text;
            setMinutes(text);
          }}
          onBlur={saveOnBlur}
        />
      ) : (
        <>
          <TextInput
            keyboardType="decimal-pad"
            onBlur={saveOnBlur}
            onChangeText={(text) => {
              const nextDraft = { text, unit };
              values.current.draft = nextDraft;
              setDraft(nextDraft);
            }}
            accessibilityLabel={t('Peso ({{unit}})', { unit })}
            placeholder={unit}
            placeholderTextColor={colors.textMuted}
            selectionColor={colors.primary}
            style={styles.input}
            value={weight}
          />
          <TextInput
            keyboardType="number-pad"
            onBlur={saveOnBlur}
            onChangeText={(text) => {
              values.current.repetitions = text;
              setRepetitions(text);
            }}
            placeholder="reps"
            accessibilityLabel={t('Reps')}
            placeholderTextColor={colors.textMuted}
            selectionColor={colors.primary}
            style={styles.input}
            value={repetitions}
          />
        </>
      )}
      <IconButton
        accessibilityLabel={t('Eliminar serie')}
        danger
        icon={<Trash2 color={colors.danger} size={18} />}
        onPress={() => onDelete(set.id)}
      />
    </View>
  );
}

function parseSetInput(weight: string, repetitions: string): UpdateWorkoutSetInput {
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
    completed: repetitions.trim() !== '',
  };
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    row: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: spacing.sm,
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
