import { usePreferencesStore } from '@/store/preferencesStore';

export function nowUtc(): string {
  return new Date().toISOString();
}

export function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat(
    usePreferencesStore.getState().language === 'es' ? 'es-CO' : 'en-US',
    {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    },
  ).format(new Date(value));
}

export function formatDuration(startedAt: string, finishedAt?: string | null): string {
  const end = finishedAt ? new Date(finishedAt).getTime() : Date.now();
  const minutes = Math.max(0, Math.round((end - new Date(startedAt).getTime()) / 60000));
  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return `${hours} h ${rest} min`;
}

export function formatTimer(seconds: number): string {
  const safeSeconds = Math.max(0, seconds);
  const mins = Math.floor(safeSeconds / 60);
  const secs = safeSeconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
