import { Check, Trash2 } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { IconButton } from '@/components/IconButton';
import { colors, radius, spacing } from '@/constants/theme';
import type { UpdateWorkoutSetInput } from '@/database/repositories/workoutRepository';
import type { WorkoutSet } from '@/types/domain';
import { dialogs } from '@/store/dialogStore';
import { getErrorMessage } from '@/utils/errors';

interface WorkoutSetRowProps {
  set: WorkoutSet;
  onDelete: (setId: string) => Promise<void>;
  onUpdate: (setId: string, input: UpdateWorkoutSetInput) => Promise<void>;
}

export function WorkoutSetRow({ set, onDelete, onUpdate }: WorkoutSetRowProps) {
  const [weight, setWeight] = useState(set.weight?.toString() ?? '');
  const [repetitions, setRepetitions] = useState(set.repetitions?.toString() ?? '');
  const [saving, setSaving] = useState(false);

  async function save(completed = set.completed) {
    const input = parseSetInput(weight, repetitions, completed);
    setSaving(true);
    try {
      await onUpdate(set.id, input);
    } catch (error) {
      dialogs.alert('No se pudo guardar la serie', getErrorMessage(error));
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
        onChangeText={setWeight}
        placeholder="kg"
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
        placeholderTextColor={colors.textMuted}
        selectionColor={colors.primary}
        style={styles.input}
        value={repetitions}
      />
      <IconButton
        accessibilityLabel={set.completed ? 'Marcar serie incompleta' : 'Marcar serie completa'}
        icon={<Check color={set.completed ? colors.ink : colors.text} size={18} />}
        onPress={toggleCompleted}
        disabled={saving}
      />
      <IconButton
        accessibilityLabel="Eliminar serie"
        danger
        icon={<Trash2 color={colors.danger} size={18} />}
        onPress={() => onDelete(set.id)}
        disabled={saving}
      />
    </View>
  );
}

function parseSetInput(weight: string, repetitions: string, completed: boolean): UpdateWorkoutSetInput {
  const parsedWeight = Number(weight.replace(',', '.'));
  const parsedRepetitions = Number(repetitions);

  return {
    weight: Number.isFinite(parsedWeight) && weight.trim() !== '' ? parsedWeight : null,
    repetitions:
      Number.isInteger(parsedRepetitions) && repetitions.trim() !== '' ? parsedRepetitions : null,
    completed,
  };
}

const styles = StyleSheet.create({
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
