'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { Language, MultilingualText } from '@/server/types/domain';
import { getLocalizedText as getLocalizedTextUtil, getLocalizedTextWithMeta, type LocalizedTextWithMeta } from '@/lib/utils/localization';

interface LanguageContextValue {
  language: Language;
  getLocalized: (text: MultilingualText | null | undefined) => string;
  getLocalizedWithMeta: (text: MultilingualText | null | undefined) => LocalizedTextWithMeta;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

interface LanguageProviderProps {
  children: ReactNode;
  language: Language;
}

/**
 * Provider component for language context
 * Language is determined by URL segment, not localStorage
 */
export function LanguageProvider({ children, language }: LanguageProviderProps) {
  const value: LanguageContextValue = {
    language,
    getLocalized: (text: MultilingualText | null | undefined) => {
      return getLocalizedTextUtil(text, language);
    },
    getLocalizedWithMeta: (text: MultilingualText | null | undefined) => {
      return getLocalizedTextWithMeta(text, language);
    },
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

/**
 * Hook to access language context
 */
export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

/**
 * Hook to get just the current language
 */
export function useCurrentLanguage(): Language {
  const { language } = useLanguage();
  return language;
}
