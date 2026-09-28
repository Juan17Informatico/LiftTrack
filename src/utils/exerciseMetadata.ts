const muscleGroupTranslations: Record<string, string> = {
  Back: 'Espalda',
  Biceps: 'Biceps',
  Calves: 'Pantorrillas',
  Chest: 'Pecho',
  Core: 'Core',
  Forearms: 'Antebrazos',
  Glutes: 'Gluteos',
  Hamstrings: 'Femorales',
  Quadriceps: 'Cuadriceps',
  Shoulders: 'Hombros',
  Triceps: 'Triceps',
};

const equipmentTranslations: Record<string, string> = {
  Barbell: 'Barra',
  Bodyweight: 'Peso corporal',
  'Cable Machine': 'Maquina de poleas',
  Dumbbells: 'Mancuernas',
  Machine: 'Maquina',
};

export function translateMuscleGroup(value: string | null | undefined): string {
  if (!value) {
    return 'Sin especificar';
  }

  return muscleGroupTranslations[value] ?? value;
}

export function translateMuscleGroups(values: string[]): string {
  return values.map(translateMuscleGroup).join(', ');
}

export function translateEquipment(value: string | null | undefined): string {
  if (!value) {
    return 'Sin especificar';
  }

  return equipmentTranslations[value] ?? value;
}
