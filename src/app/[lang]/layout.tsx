import { notFound } from 'next/navigation';
import { LanguageProvider } from '@/lib/hooks/use-language';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import type { Language } from '@/server/types/domain';
import { VALID_LANGUAGES } from '@/server/types/domain';

interface Props {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}

/**
 * Layout for language-specific routes
 * Validates the language param and provides language context
 */
export default async function LanguageLayout({ children, params }: Props) {
  const { lang } = await params;

  // Validate language parameter
  if (!VALID_LANGUAGES.has(lang)) {
    notFound();
  }

  const validLang = lang as Language;

  return (
    <LanguageProvider language={validLang}>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </div>
    </LanguageProvider>
  );
}

/**
 * Generate static params for all supported languages
 */
export function generateStaticParams() {
  return [
    { lang: 'nl' },
    { lang: 'fr' },
    { lang: 'de' },
    { lang: 'en' },
  ];
}
