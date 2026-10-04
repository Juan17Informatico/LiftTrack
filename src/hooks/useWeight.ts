import { usePreferencesStore } from '@/store/preferencesStore';
import { formatWeight } from '@/utils/weight';

export function useWeight() {
  const unit = usePreferencesStore((state) => state.unit);
  const language = usePreferencesStore((state) => state.language);
  return { unit, format: (value: number | null) => formatWeight(value, unit, language) };
}
