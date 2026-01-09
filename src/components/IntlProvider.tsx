'use client';

import { NextIntlClientProvider } from 'next-intl';
import { useLanguage, type Language } from './LanguageSwitcher';
import { ReactNode } from 'react';

// Import all message files
import en from '@/messages/en.json';
import fr from '@/messages/fr.json';
import nl from '@/messages/nl.json';
import de from '@/messages/de.json';

const messages: Record<Language, typeof en> = { en, fr, nl, de };

interface IntlProviderProps {
  children: ReactNode;
}

export function IntlProvider({ children }: IntlProviderProps) {
  const [language] = useLanguage();

  return (
    <NextIntlClientProvider
      locale={language}
      messages={messages[language]}
      timeZone="Europe/Brussels"
    >
      {children}
    </NextIntlClientProvider>
  );
}
