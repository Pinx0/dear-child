
import { enUS } from './translations/en-US';
import { esES } from './translations/es-ES';
import type { TranslationKeys } from './translations/types';

const translations: Record<string, TranslationKeys> = {
  'en-US': enUS,
  'es-ES': esES,
} as const;

export type SupportedLanguage = keyof typeof translations;

function isSupportedLanguage(language: string): language is SupportedLanguage {
  return language in translations;
}

function getCurrentLanguage(): SupportedLanguage {
  const language = process.env.LANGUAGE || 'en-US';
  
  if (isSupportedLanguage(language)) {
    return language;
  }
  
  return 'en-US';
}

export function translate(key: keyof TranslationKeys, replacements: Record<string, string | number> = {}): string {
  const language = getCurrentLanguage();
  const currentTranslations = translations[language] || translations['en-US'];
  
  let translated = currentTranslations[key] || key;
  
  Object.entries(replacements).forEach(([placeholder, value]) => {
    const regex = new RegExp(`\\{${placeholder}\\}`, 'g');
    translated = translated.replace(regex, String(value));
  });
  
  return translated;
}
