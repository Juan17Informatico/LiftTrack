import { walkingExerciseId } from '@/database/seed/exercises';
import { translateMessage } from '@/i18n';

type GuideStep =
  | { exerciseId: string; sets: number; reps: string; restSeconds: number }
  | { exerciseId: string; pacing: string };

export interface BaseRoutine {
  id: string;
  name: string;
  description: string;
  steps: GuideStep[];
}

const bench = '9b125adc-4eb6-477f-8e75-f7a22c76ac01';
const inclinePress = '6d7fae87-4fe9-48c9-97f1-85494848e718';
const curl = '95a6b759-13fb-4073-b6ae-0360699a40a9';
const pushdown = '8b183196-1678-4c37-b463-74979b856379';
const hammerCurl = 'b2d8201d-0df8-4ed5-ad58-fdb38a1cf466';
const legPress = 'de5d23c9-a3eb-4f27-a798-97c1552fbc69';
const legCurl = '3e2c7075-733d-4c9a-a144-04cbe83d5027';
const calfRaise = '9f1eead5-fb14-4d55-8f36-c852dba1e81a';
const pulldown = 'efeef4fa-81d6-4a7d-9d99-2e1f2f2fcbac';
const shoulderPress = 'a2ed917f-c236-4a84-9f4d-729e69178c89';
const hipThrust = '46f8a0c0-c3ff-4c44-8c1d-58c7cfc8a1b2';
const deadlift = 'b4b6070f-00ff-4ccc-a146-c9852f745f19';

function strength(exerciseId: string, sets: number, reps: string, restSeconds: number): GuideStep {
  return { exerciseId, sets, reps, restSeconds };
}

export const baseRoutines: BaseRoutine[] = [
  {
    id: 'chest',
    name: 'Pecho',
    description: 'Dos ángulos de empuje con barra y mancuernas.',
    steps: [strength(bench, 3, '8–10', 90), strength(inclinePress, 2, '10–12', 90)],
  },
  {
    id: 'arms',
    name: 'Brazos',
    description: 'Alterna bíceps y tríceps con mancuernas y polea.',
    steps: [
      strength(curl, 2, '10–12', 60),
      strength(pushdown, 2, '10–12', 60),
      strength(hammerCurl, 2, '10–12', 60),
    ],
  },
  {
    id: 'legs',
    name: 'Piernas',
    description: 'Trabaja cuádriceps, femorales y pantorrillas en máquinas.',
    steps: [
      strength(legPress, 3, '8–12', 90),
      strength(legCurl, 2, '10–12', 60),
      strength(calfRaise, 2, '12–15', 60),
    ],
  },
  {
    id: 'cardio',
    name: 'Cardio',
    description: 'Caminata al aire libre o en cinta, con cambios de ritmo.',
    steps: [
      { exerciseId: walkingExerciseId, pacing: '5 min suaves · 10 min a paso vivo · 5 min suaves' },
    ],
  },
  {
    id: 'upper',
    name: 'Tren superior (Upper)',
    description: 'Combina empujes y tirones para pecho, espalda y hombros.',
    steps: [
      strength(bench, 2, '8–10', 90),
      strength(pulldown, 2, '10–12', 90),
      strength(shoulderPress, 2, '8–10', 90),
      strength(curl, 2, '10–12', 60),
    ],
  },
  {
    id: 'lower',
    name: 'Tren inferior (Lower)',
    description: 'Combina prensa y trabajo de cadera para piernas y glúteos.',
    steps: [
      strength(legPress, 2, '8–12', 90),
      strength(deadlift, 2, '8–10', 90),
      strength(hipThrust, 2, '10–12', 90),
      strength(calfRaise, 2, '12–15', 60),
    ],
  },
];

export function stepTarget(step: GuideStep): string {
  if ('pacing' in step) return translateMessage(step.pacing);
  return translateMessage('{{sets}} series de {{reps}} reps · {{rest}} s de descanso', {
    sets: step.sets,
    reps: step.reps,
    rest: step.restSeconds,
  });
}
