import { languages } from '@/data/languages';

const LANGUAGE_STORAGE_KEY = 'antitok_preferred_language';

export const getStoredLanguage = (): string => {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') return 'English';
  
  try {
    const storedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    // Validate that the stored language is in our list of languages
    if (storedLanguage && languages.includes(storedLanguage)) {
      return storedLanguage;
    }
  } catch (error) {
    console.error('Error accessing localStorage:', error);
  }
  
  return 'English';
};

export const setStoredLanguage = (language: string): void => {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch (error) {
    console.error('Error setting language in localStorage:', error);
  }
}; 