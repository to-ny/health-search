'use client';

import { useTranslations } from 'next-intl';

export function Footer() {
  const t = useTranslations();

  return (
    <footer className="border-t border-gray-200 bg-white py-8 dark:border-gray-800 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('footer.dataSource')}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('footer.disclaimer')}
          </p>
        </div>
      </div>
    </footer>
  );
}
