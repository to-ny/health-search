'use client';

import { useTranslations } from 'next-intl';

type EnumCategory = 'status' | 'medicineType' | 'ingredientType';

/**
 * Hook that returns a function to translate enum values
 * Falls back to formatted enum value if translation is not found
 */
export function useTranslatedEnum() {
  const t = useTranslations();

  return (category: EnumCategory, value: string | undefined): string => {
    if (!value) return '';

    // Try to get translation
    try {
      const translated = t(`enum.${category}.${value}`);
      // If translation key exists, return it
      if (translated && !translated.startsWith('enum.')) {
        return translated;
      }
    } catch {
      // Translation not found, fall through to fallback
    }

    // Fallback: convert ENUM_VALUE to "Enum Value"
    return value
      .toLowerCase()
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
}
