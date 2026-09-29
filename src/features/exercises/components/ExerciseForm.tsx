import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Check, Plus } from 'lucide-react-native';

import { AppButton } from '@/components/AppButton';
import { FormTextInput } from '@/components/FormTextInput';
import { colors } from '@/constants/theme';
import { exerciseFormSchema, type ExerciseFormInput } from '@/schemas/exerciseSchemas';
import { dialogs } from '@/store/dialogStore';
import { getErrorMessage } from '@/utils/errors';
import { translateMuscleGroup } from '@/utils/exerciseMetadata';

const muscleGroups = ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Quadriceps', 'Hamstrings', 'Glutes', 'Calves', 'Core', 'Forearms'];

interface ExerciseFormProps {
  initialValues?: ExerciseFormInput;
  onSave: (input: ExerciseFormInput) => Promise<void>;
}

export function ExerciseForm({ initialValues, onSave }: ExerciseFormProps) {
  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<ExerciseFormInput>({
    resolver: zodResolver(exerciseFormSchema),
    defaultValues: initialValues ?? { name: '', muscleGroup: '', equipment: '', instructions: '' },
  });
  const save = handleSubmit(async (input) => {
    try { await onSave(input); }
    catch (error) { dialogs.alert('No pudimos guardar el ejercicio', getErrorMessage(error)); }
  });

  return (
    <View style={styles.form}>
      <Text style={styles.section}>01 · IDENTIDAD</Text>
      <Controller control={control} name="name" render={({ field }) => (
        <FormTextInput label="Nombre del ejercicio" placeholder="Ej. Sentadilla con pausa" maxLength={100}
          value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} error={errors.name?.message} editable={!isSubmitting} />
      )} />
      <Text style={styles.label}>Grupo muscular principal</Text>
      <Controller control={control} name="muscleGroup" render={({ field }) => (
        <View style={styles.chips}>
          {[...new Set([...muscleGroups, ...(field.value ? [field.value] : [])])].map((group) => (
            <Pressable key={group} accessibilityRole="button" accessibilityState={{ selected: field.value === group, disabled: isSubmitting }}
              disabled={isSubmitting} onPress={() => field.onChange(group)}
              style={[styles.chip, field.value === group && styles.selected]}>
              <Text style={[styles.chipText, field.value === group && styles.selectedText]}>{translateMuscleGroup(group)}</Text>
            </Pressable>
          ))}
        </View>
      )} />
      {errors.muscleGroup ? <Text style={styles.error}>{errors.muscleGroup.message}</Text> : null}
      <View style={styles.divider} />
      <Text style={styles.section}>02 · DETALLES OPCIONALES</Text>
      <Controller control={control} name="equipment" render={({ field }) => (
        <FormTextInput label="Equipo" placeholder="Mancuernas, barra, peso corporal…" maxLength={100}
          value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} error={errors.equipment?.message} editable={!isSubmitting} />
      )} />
      <Controller control={control} name="instructions" render={({ field }) => (
        <FormTextInput label="Cómo realizarlo" placeholder="Describe la posición inicial, el movimiento y tus recomendaciones."
          multiline maxLength={2000} style={styles.instructions} value={field.value} onChangeText={field.onChange} onBlur={field.onBlur}
          error={errors.instructions?.message} editable={!isSubmitting} />
      )} />
      <Text style={styles.note}>Disponible al instante en tu catálogo, rutinas y entrenamientos. Se guarda en este dispositivo.</Text>
      <AppButton label={isSubmitting ? 'Guardando…' : initialValues ? 'Guardar cambios' : 'Crear ejercicio'}
        icon={initialValues ? <Check size={18} color={colors.ink} /> : <Plus size={18} color={colors.ink} />}
        onPress={save} disabled={isSubmitting} />
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: 16, backgroundColor: colors.surface, borderRadius: 22, borderWidth: 1, borderColor: colors.border, padding: 20 },
  section: { color: '#32E6B0', fontSize: 10, fontWeight: '800', letterSpacing: 1.6 },
  label: { color: colors.text, fontSize: 13, fontWeight: '700' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderWidth: 1, borderColor: colors.border, borderRadius: 22, minHeight: 44, paddingHorizontal: 14, justifyContent: 'center' },
  selected: { borderColor: '#32E6B0', backgroundColor: '#32E6B014' },
  chipText: { color: colors.textMuted, fontSize: 13 }, selectedText: { color: '#32E6B0', fontWeight: '700' },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 4 },
  instructions: { minHeight: 120, textAlignVertical: 'top' },
  note: { color: colors.textMuted, fontSize: 12, lineHeight: 19 }, error: { color: colors.danger, fontSize: 12 },
});
