'use client';

import { ReactNode } from 'react';
import { IntlProvider } from '../IntlProvider';
import { Header } from './Header';
import { Footer } from './Footer';

interface ClientLayoutProps {
  children: ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <IntlProvider>
      {/* Skip to main content link for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-blue-600 focus:px-4 focus:py-2 focus:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
      >
        Skip to main content
      </a>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main id="main-content" className="flex-1" tabIndex={-1}>
          {children}
        </main>
        <Footer />
      </div>
    </IntlProvider>
  );
}
