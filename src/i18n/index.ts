import { useCallback } from 'react';

import { english } from '@/i18n/messages';
import type { AppLanguage } from '@/services/preferences';
import { usePreferencesStore } from '@/store/preferencesStore';

type Parameters = Record<string, string | number>;

export function translate(message: string, language: AppLanguage, parameters?: Parameters): string {
  const template =
    language === 'en' ? (english[message as keyof typeof english] ?? message) : message;
  return template.replace(/\{\{(\w+)\}\}/g, (match, key: string) =>
    String(parameters?.[key] ?? match),
  );
}

export function translateMessage(message: string, parameters?: Parameters): string {
  return translate(message, usePreferencesStore.getState().language, parameters);
}

export function useTranslation() {
  const language = usePreferencesStore((state) => state.language);
  const t = useCallback(
    (message: string, parameters?: Parameters) => translate(message, language, parameters),
    [language],
  );
  return { t, language };
}
