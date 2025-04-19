'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getStoredLanguage, setStoredLanguage } from '@/utils/languageUtils';

type LanguageContextType = {
  language: string;
  setLanguage: (language: string) => void;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Initialize with the stored language value directly
  const [language, setLanguageState] = useState<string>(() => {
    // Only access localStorage during client-side rendering
    if (typeof window !== 'undefined') {
      return getStoredLanguage();
    }
    return 'English'; // Default for server-side rendering
  });

  const setLanguage = (newLanguage: string) => {
    setLanguageState(newLanguage);
    setStoredLanguage(newLanguage);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
} 