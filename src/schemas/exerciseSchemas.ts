import { z } from 'zod';

export const exerciseFormSchema = z.object({
  name: z.string().trim().min(2, 'Escribe al menos 2 caracteres.').max(100, 'Máximo 100 caracteres.'),
  muscleGroup: z.string().trim().min(1, 'Selecciona un grupo muscular.').max(60),
  equipment: z.string().trim().max(100, 'Máximo 100 caracteres.'),
  instructions: z.string().trim().max(2000, 'Máximo 2000 caracteres.'),
});

export type ExerciseFormInput = z.infer<typeof exerciseFormSchema>;
