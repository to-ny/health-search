import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { ClientLayout } from '@/components/layout/ClientLayout';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Health-search | Belgium Medication Database',
  description: 'Search and compare medications from Belgium\'s official SAM database. Find prices, reimbursement info, generic equivalents, and more.',
  keywords: ['medication', 'Belgium', 'pharmacy', 'drugs', 'reimbursement', 'CNK', 'generic'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-gray-50 font-sans antialiased dark:bg-gray-900`}
      >
        <QueryProvider>
          <ClientLayout>{children}</ClientLayout>
        </QueryProvider>
      </body>
    </html>
  );
}
