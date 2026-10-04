import { localKeys } from '@/database/localData';
import { useLocalQuery } from '@/hooks/useLocalQuery';
import { useRepositories } from '@/hooks/useRepositories';
import { useMemo } from 'react';
import { useTranslation } from '@/i18n';
import { exerciseName } from '@/i18n/exercises';

export function useExerciseCatalog(search?: string) {
  const { language } = useTranslation();
  const { exercises: repository } = useRepositories();
  const { data, ...state } = useLocalQuery(localKeys.exercises(), () => repository.findAll(), true);
  const exercises = useMemo(() => {
    const normalize = (value: string) =>
      value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLocaleLowerCase(language);
    const term = normalize(search?.trim() ?? '');
    return (data ?? []).filter(
      (exercise) =>
        normalize(exerciseName(exercise)).includes(term) || normalize(exercise.name).includes(term),
    );
  }, [data, search, language]);
  return { exercises, ...state };
}
