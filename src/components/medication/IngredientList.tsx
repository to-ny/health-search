'use client';

import { useTranslations } from 'next-intl';
import { findAllergens, type WarningLevel } from '@/lib/utils/allergens';
import type { Ingredient, MedicationComponent } from '@/lib/types';

interface IngredientListProps {
  components: MedicationComponent[];
  excludedIngredients?: string[];
  showAllComponents?: boolean;
}

export function IngredientList({
  components,
  excludedIngredients = [],
  showAllComponents = false,
}: IngredientListProps) {
  const t = useTranslations();
  // Combine all ingredients or show by component
  const allIngredients = components.flatMap((c) => c.ingredients);
  const activeIngredients = allIngredients.filter((i) => i.type === 'ACTIVE_SUBSTANCE');
  const excipients = allIngredients.filter((i) => i.type !== 'ACTIVE_SUBSTANCE');

  // Find allergens
  const allergens = findAllergens(allIngredients);

  // Get form and route info from first component (usually only one)
  const primaryComponent = components[0];

  return (
    <div className="space-y-6">
      {/* Form & Administration - shown first as context */}
      {showAllComponents && primaryComponent && (
        <dl className="grid gap-3 sm:grid-cols-2">
          {primaryComponent.pharmaceuticalForm && (
            <div>
              <dt className="text-sm text-gray-500 dark:text-gray-400">{t('ingredients.pharmaceuticalForm')}</dt>
              <dd className="font-medium text-gray-900 dark:text-white">
                {primaryComponent.pharmaceuticalForm.name}
              </dd>
            </div>
          )}
          {primaryComponent.routeOfAdministration && (
            <div>
              <dt className="text-sm text-gray-500 dark:text-gray-400">{t('ingredients.routeOfAdmin')}</dt>
              <dd className="font-medium text-gray-900 dark:text-white">
                {primaryComponent.routeOfAdministration.name}
              </dd>
            </div>
          )}
        </dl>
      )}

      {/* Allergen warnings - prominent at top */}
      {allergens.length > 0 && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
          <div className="flex items-start gap-3">
            <span className="text-xl text-yellow-600" aria-hidden="true">⚠</span>
            <div>
              <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">
                {t('ingredients.allergensDetected')}
              </h4>
              <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                {allergens.join(', ')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Active ingredients */}
      <div>
        <h4 className="mb-3 text-sm font-medium text-gray-500 dark:text-gray-400">
          {t('ingredients.activeIngredients')}
        </h4>
        {activeIngredients.length > 0 ? (
          <ul className="space-y-2">
            {activeIngredients.map((ingredient, index) => (
              <IngredientItem
                key={`active-${index}`}
                ingredient={ingredient}
                excludedIngredients={excludedIngredients}
                allergens={allergens}
              />
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('ingredients.noActiveIngredients')}</p>
        )}
      </div>

      {/* Excipients (if showing all) */}
      {showAllComponents && excipients.length > 0 && (
        <div>
          <h4 className="mb-3 text-sm font-medium text-gray-500 dark:text-gray-400">
            {t('ingredients.otherIngredients')}
          </h4>
          <ul className="space-y-2">
            {excipients.map((ingredient, index) => (
              <IngredientItem
                key={`excipient-${index}`}
                ingredient={ingredient}
                excludedIngredients={excludedIngredients}
                allergens={allergens}
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

interface IngredientItemProps {
  ingredient: Ingredient;
  excludedIngredients: string[];
  allergens: string[];
}

function IngredientItem({ ingredient, excludedIngredients, allergens }: IngredientItemProps) {
  const t = useTranslations();
  const isExcluded = excludedIngredients.some((ex) =>
    ingredient.substanceName.toLowerCase().includes(ex.toLowerCase())
  );

  const isAllergen = allergens.some((allergen) =>
    ingredient.substanceName.toLowerCase().includes(allergen.toLowerCase())
  );

  const warningLevel: WarningLevel = isExcluded ? 'danger' : isAllergen ? 'warning' : 'none';

  return (
    <li
      className={`flex items-center justify-between rounded-lg border p-3 ${
        warningLevel === 'danger'
          ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
          : warningLevel === 'warning'
          ? 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20'
          : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'
      }`}
    >
      <div className="flex items-center gap-2">
        {warningLevel !== 'none' && (
          <span
            className={`text-base ${warningLevel === 'danger' ? 'text-red-500' : 'text-yellow-500'}`}
            aria-label={warningLevel === 'danger' ? t('ingredients.excludedIngredient') : t('ingredients.potentialAllergen')}
          >
            ⚠
          </span>
        )}
        <span className="font-medium text-gray-900 dark:text-white">
          {ingredient.substanceName}
        </span>
      </div>
      {ingredient.strengthDescription && (
        <span className="ml-4 text-sm text-gray-600 dark:text-gray-400">
          {ingredient.strengthDescription}
        </span>
      )}
    </li>
  );
}
