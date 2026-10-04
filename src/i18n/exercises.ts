import { exerciseSeed } from '@/database/seed/exercises';
import { translateMessage } from '@/i18n';
import { usePreferencesStore } from '@/store/preferencesStore';
import type { Exercise } from '@/types/domain';

const seeds = new Map(exerciseSeed.map((exercise) => [exercise.id, exercise]));
const spanishNames: Record<string, string> = {
  'Bench Press': 'Press de banca',
  'Incline Dumbbell Press': 'Press inclinado con mancuernas',
  'Chest Press Machine': 'Press de pecho en máquina',
  'Lat Pulldown': 'Jalón al pecho',
  'Seated Cable Row': 'Remo sentado en polea',
  'Barbell Row': 'Remo con barra',
  'Bicep Curl': 'Curl de bíceps',
  'Hammer Curl': 'Curl martillo',
  'Tricep Pushdown': 'Extensión de tríceps en polea',
  'Overhead Tricep Extension': 'Extensión de tríceps sobre la cabeza',
  'Shoulder Press': 'Press de hombros',
  'Lateral Raise': 'Elevación lateral',
  'Leg Press': 'Prensa de piernas',
  'Leg Extension': 'Extensión de piernas',
  'Leg Curl': 'Curl femoral',
  'Romanian Deadlift': 'Peso muerto rumano',
  'Hip Thrust': 'Empuje de cadera',
  'Calf Raise': 'Elevación de pantorrillas',
  'Cable Crunch': 'Crunch en polea',
  Plank: 'Plancha',
};

// Only localize unchanged built-in content. Never rewrite stored or user-authored text.
export function exerciseName(exercise: Exercise | undefined): string {
  if (!exercise) return translateMessage('Ejercicio');
  const seed = seeds.get(exercise.id);
  return seed?.name === exercise.name && usePreferencesStore.getState().language === 'es'
    ? (spanishNames[seed.name] ?? exercise.name)
    : exercise.name;
}

export function exerciseInstructions(exercise: Exercise): string | null {
  const seed = seeds.get(exercise.id);
  return seed?.instructions === exercise.instructions && exercise.instructions
    ? translateMessage(exercise.instructions)
    : exercise.instructions;
}
