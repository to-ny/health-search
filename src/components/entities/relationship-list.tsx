'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRightIcon } from '@heroicons/react/20/solid';
import { EntityTypeBadge } from './entity-type-badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';
import { useLanguage } from '@/lib/hooks/use-language';
import { useTranslation } from '@/lib/hooks/use-translation';
import { LocalizedText } from '@/components/shared/localized-text';
import { generateEntitySlug, generateCompanySlug, generateATCSlug } from '@/lib/utils/slug';
import type { EntityType, MultilingualText, Language } from '@/server/types/domain';

interface RelationshipItem {
  entityType: EntityType;
  code: string;
  name: MultilingualText;
  subtitle?: string;
}

interface RelationshipListProps {
  title: string;
  items: RelationshipItem[];
  maxInitialDisplay?: number;
  className?: string;
  getHref?: (item: RelationshipItem, lang: Language) => string;
}

function getDefaultHref(item: RelationshipItem, lang: Language): string {
  switch (item.entityType) {
    case 'vtm':
    case 'substance': {
      const slug = generateEntitySlug(item.name, item.code, lang);
      return `/${lang}/substances/${slug}`;
    }
    case 'vmp': {
      const slug = generateEntitySlug(item.name, item.code, lang);
      return `/${lang}/generics/${slug}`;
    }
    case 'amp': {
      const slug = generateEntitySlug(item.name, item.code, lang);
      return `/${lang}/medications/${slug}`;
    }
    case 'ampp': {
      const slug = generateEntitySlug(item.name, item.code, lang);
      return `/${lang}/packages/${slug}`;
    }
    case 'company': {
      const companyName = item.name?.nl || item.name?.fr || item.name?.en || item.name?.de || '';
      const slug = generateCompanySlug(companyName, item.code);
      return `/${lang}/companies/${slug}`;
    }
    case 'vmp_group': {
      const slug = generateEntitySlug(item.name, item.code, lang);
      return `/${lang}/therapeutic-groups/${slug}`;
    }
    case 'atc': {
      const slug = generateATCSlug(item.code, item.name, lang);
      return `/${lang}/classifications/${slug}`;
    }
    default:
      return '#';
  }
}

export function RelationshipList({
  title,
  items,
  maxInitialDisplay = 5,
  className,
  getHref = getDefaultHref,
}: RelationshipListProps) {
  const [showAll, setShowAll] = useState(false);
  const { language } = useLanguage();
  const { t } = useTranslation();

  if (items.length === 0) {
    return null;
  }

  const displayedItems = showAll ? items : items.slice(0, maxInitialDisplay);
  const hasMore = items.length > maxInitialDisplay;

  return (
    <div className={cn('space-y-3', className)}>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
        {title}
        <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
          ({items.length})
        </span>
      </h3>

      <div className="space-y-2">
        {displayedItems.map((item) => (
          <Link
            key={`${item.entityType}-${item.code}`}
            href={getHref(item, language)}
            className="group block"
          >
            <div className={cn(
              'flex items-center gap-3 p-3 rounded-lg',
              'bg-gray-50 dark:bg-gray-800/50',
              'hover:bg-gray-100 dark:hover:bg-gray-800',
              'transition-colors duration-150'
            )}>
              <EntityTypeBadge type={item.entityType} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-gray-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  <LocalizedText text={item.name} />
                </p>
                {item.subtitle && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {item.subtitle}
                  </p>
                )}
              </div>
              <ChevronRightIcon className="h-5 w-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 flex-shrink-0" />
            </div>
          </Link>
        ))}
      </div>

      {hasMore && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAll(!showAll)}
          className="w-full"
        >
          {showAll ? t('common.showLess') : `${t('common.showAll')} ${items.length}`}
        </Button>
      )}
    </div>
  );
}
