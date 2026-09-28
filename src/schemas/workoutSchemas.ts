import { z } from 'zod';

export const workoutSetSchema = z.object({
  weight: z.number().nonnegative().nullable(),
  repetitions: z.number().int().positive().nullable(),
  completed: z.boolean(),
});

export type WorkoutSetInput = z.infer<typeof workoutSetSchema>;
