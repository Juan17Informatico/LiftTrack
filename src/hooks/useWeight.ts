import { usePreferencesStore } from '@/store/preferencesStore';
import { formatWeight } from '@/utils/weight';
import { walkingExerciseId } from '@/database/seed/exercises';
import type { WorkoutSet } from '@/types/domain';

export function useWeight() {
  const unit = usePreferencesStore((state) => state.unit);
  const language = usePreferencesStore((state) => state.language);
  const format = (value: number | null) => formatWeight(value, unit, language);
  function formatSet(
    exerciseId: string,
    set: Pick<WorkoutSet, 'weight' | 'repetitions' | 'durationSeconds'>,
  ) {
    if (exerciseId === walkingExerciseId)
      return set.durationSeconds === null ? '—' : `${set.durationSeconds / 60} min`;
    return `${format(set.weight)} ${unit} × ${set.repetitions ?? '-'}`;
  }
  return { unit, format, formatSet };
}
