import type { WeightUnit } from '@/types/domain';

const POUNDS_PER_KILOGRAM = 2.2046226218487757;

// SQLite always stores kilograms. Changing the preference never rewrites history.
export function toDisplayWeight(kilograms: number, unit: WeightUnit): number {
  return unit === 'lb' ? kilograms * POUNDS_PER_KILOGRAM : kilograms;
}

export function toStoredWeight(value: number, unit: WeightUnit): number {
  return unit === 'lb' ? value / POUNDS_PER_KILOGRAM : value;
}

export function weightInput(value: number | null, unit: WeightUnit): string {
  return value === null ? '' : String(Number(toDisplayWeight(value, unit).toFixed(2)));
}

export function formatWeight(value: number | null, unit: WeightUnit, language: string): string {
  if (value === null) return '—';
  return new Intl.NumberFormat(language, { maximumFractionDigits: 2 }).format(
    toDisplayWeight(value, unit),
  );
}
