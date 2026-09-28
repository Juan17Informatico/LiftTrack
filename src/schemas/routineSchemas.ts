import { z } from 'zod';

export const routineFormSchema = z.object({
  name: z.string().trim().min(1, 'El nombre es obligatorio').max(80, 'El nombre es demasiado largo'),
  description: z.string().trim().max(240, 'La descripcion es demasiado larga').optional(),
});

export const addRoutineExerciseSchema = z.object({
  exerciseId: z.string().uuid(),
  targetSets: z.number().int().positive().nullable().optional(),
  minReps: z.number().int().positive().nullable().optional(),
  maxReps: z.number().int().positive().nullable().optional(),
  restSeconds: z.number().int().positive().nullable().optional(),
});

export type RoutineFormInput = z.infer<typeof routineFormSchema>;
export type AddRoutineExerciseInput = z.infer<typeof addRoutineExerciseSchema>;
