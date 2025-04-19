import { languages } from '@/data/languages';

const LANGUAGE_STORAGE_KEY = 'antitok_preferred_language';

export const getStoredLanguage = (): string => {
  if (typeof window === 'undefined') return 'en';
  
  const storedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return storedLanguage || 'en';
};

export const setStoredLanguage = (languageCode: string): void => {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem(LANGUAGE_STORAGE_KEY, languageCode);
};

export const getLanguageName = (languageCode: string): string => {
  const language = languages.find(lang => lang.code === languageCode);
  return language ? language.name : 'English';
}; 