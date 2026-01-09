/**
 * Allergen and ingredient utilities
 */

import type { Ingredient, MedicationComponent } from '@/lib/types';

/**
 * Common allergens and their alternative names
 */
export const COMMON_ALLERGENS: Record<string, string[]> = {
  lactose: ['lactose', 'milk sugar', 'lactosum'],
  gluten: ['gluten', 'wheat', 'barley', 'rye', 'oat'],
  soy: ['soy', 'soya', 'soybean', 'lecithin'],
  peanut: ['peanut', 'arachis', 'groundnut'],
  'tree nut': ['almond', 'hazelnut', 'walnut', 'cashew', 'pistachio', 'macadamia', 'brazil nut'],
  egg: ['egg', 'ovalbumin', 'lysozyme'],
  shellfish: ['shellfish', 'crustacean', 'shrimp', 'lobster', 'crab'],
  fish: ['fish oil', 'omega-3', 'cod liver'],
  sulfite: ['sulfite', 'sulphite', 'sodium metabisulfite', 'potassium metabisulfite'],
  tartrazine: ['tartrazine', 'e102', 'fd&c yellow 5'],
  aspartame: ['aspartame', 'e951'],
  benzalkonium: ['benzalkonium', 'bak'],
};

/**
 * Checks if an ingredient name matches an allergen
 */
export function matchesAllergen(ingredientName: string, allergen: string): boolean {
  const normalizedIngredient = ingredientName.toLowerCase();
  const allergenNames = COMMON_ALLERGENS[allergen.toLowerCase()] || [allergen.toLowerCase()];

  return allergenNames.some((name) => normalizedIngredient.includes(name));
}

/**
 * Finds all allergens in a list of ingredients
 */
export function findAllergens(ingredients: Ingredient[]): string[] {
  const foundAllergens = new Set<string>();

  for (const ingredient of ingredients) {
    const normalizedName = ingredient.substanceName.toLowerCase();

    for (const [allergen, aliases] of Object.entries(COMMON_ALLERGENS)) {
      if (aliases.some((alias) => normalizedName.includes(alias))) {
        foundAllergens.add(allergen);
      }
    }
  }

  return Array.from(foundAllergens);
}

/**
 * Checks if a medication contains any of the excluded ingredients
 */
export function containsExcludedIngredient(
  components: MedicationComponent[],
  excludedIngredients: string[]
): { contains: boolean; matches: string[] } {
  const matches: string[] = [];

  for (const component of components) {
    for (const ingredient of component.ingredients) {
      const normalizedName = ingredient.substanceName.toLowerCase();

      for (const excluded of excludedIngredients) {
        if (matchesAllergen(normalizedName, excluded)) {
          matches.push(ingredient.substanceName);
        }
      }
    }
  }

  return {
    contains: matches.length > 0,
    matches: [...new Set(matches)],
  };
}

/**
 * Gets a warning level for a medication based on properties
 */
export type WarningLevel = 'none' | 'info' | 'warning' | 'danger';

export interface MedicationWarning {
  level: WarningLevel;
  type: string;
  message: string;
}

export function getMedicationWarnings(
  components: MedicationComponent[],
  excludedIngredients: string[] = []
): MedicationWarning[] {
  const warnings: MedicationWarning[] = [];

  // Check for excluded ingredients
  const excluded = containsExcludedIngredient(components, excludedIngredients);
  if (excluded.contains) {
    warnings.push({
      level: 'danger',
      type: 'excluded_ingredient',
      message: `Contains excluded ingredient(s): ${excluded.matches.join(', ')}`,
    });
  }

  // Check common allergens
  const allIngredients = components.flatMap((c) => c.ingredients);
  const allergens = findAllergens(allIngredients);

  for (const allergen of allergens) {
    // Don't duplicate if already in excluded
    if (!excludedIngredients.some((e) => e.toLowerCase() === allergen.toLowerCase())) {
      warnings.push({
        level: 'info',
        type: 'allergen',
        message: `Contains common allergen: ${allergen}`,
      });
    }
  }

  return warnings;
}
