/**
 * Allergen and ingredient utilities
 */

import type { Ingredient, MedicationComponent } from '@/lib/types';
import { getExcipients } from '@/lib/services/excipients';

/**
 * Common allergens and their alternative names
 * Includes English, French, Dutch, and German translations
 */
export const COMMON_ALLERGENS: Record<string, string[]> = {
  lactose: [
    // English
    'lactose', 'milk sugar', 'lactosum',
    // French
    'lactose monohydraté', 'lactose anhydre',
    // Dutch
    'lactosemonohydraat', 'watervrije lactose',
    // German
    'laktose', 'milchzucker',
  ],
  gluten: [
    // English
    'gluten', 'wheat', 'barley', 'rye', 'oat',
    // French
    'blé', 'orge', 'seigle', 'avoine', 'froment',
    // Dutch
    'tarwe', 'gerst', 'rogge', 'haver', 'gluten',
    // German
    'weizen', 'gerste', 'roggen', 'hafer',
  ],
  soy: [
    // English
    'soy', 'soya', 'soybean', 'lecithin',
    // French
    'soja', 'lécithine',
    // Dutch
    'soja', 'lecithine',
    // German
    'soja', 'lecithin',
  ],
  peanut: [
    // English
    'peanut', 'arachis', 'groundnut',
    // French
    'arachide', 'cacahuète',
    // Dutch
    'pinda', 'aardnoot',
    // German
    'erdnuss', 'erdnüsse',
  ],
  'tree nut': [
    // English
    'almond', 'hazelnut', 'walnut', 'cashew', 'pistachio', 'macadamia', 'brazil nut',
    // French
    'amande', 'noisette', 'noix', 'cajou', 'pistache', 'macadamia',
    // Dutch
    'amandel', 'hazelnoot', 'walnoot', 'cashew', 'pistache',
    // German
    'mandel', 'haselnuss', 'walnuss', 'cashew', 'pistazie',
  ],
  egg: [
    // English
    'egg', 'ovalbumin', 'lysozyme',
    // French
    'oeuf', 'ovalbumine', 'lysozyme',
    // Dutch
    'ei', 'eiwit', 'ovalbumine', 'lysozym',
    // German
    'ei', 'ovalbumin', 'lysozym',
  ],
  shellfish: [
    // English
    'shellfish', 'crustacean', 'shrimp', 'lobster', 'crab',
    // French
    'crustacé', 'crevette', 'homard', 'crabe',
    // Dutch
    'schaaldier', 'garnaal', 'kreeft', 'krab',
    // German
    'schalentier', 'garnele', 'hummer', 'krabbe',
  ],
  fish: [
    // English
    'fish oil', 'omega-3', 'cod liver',
    // French
    'huile de poisson', 'oméga-3', 'foie de morue',
    // Dutch
    'visolie', 'omega-3', 'levertraan',
    // German
    'fischöl', 'omega-3', 'lebertran',
  ],
  sulfite: [
    // English
    'sulfite', 'sulphite', 'sodium metabisulfite', 'potassium metabisulfite',
    // French
    'sulfite', 'métabisulfite de sodium', 'métabisulfite de potassium', 'anhydride sulfureux',
    // Dutch
    'sulfiet', 'natriummetabisulfiet', 'kaliummetabisulfiet',
    // German
    'sulfit', 'natriummetabisulfit', 'kaliummetabisulfit',
  ],
  tartrazine: [
    // All languages use similar names
    'tartrazine', 'e102', 'fd&c yellow 5', 'tartrazin',
  ],
  aspartame: [
    // All languages use similar names
    'aspartame', 'e951', 'aspartaam',
  ],
  benzalkonium: [
    // English/French/Dutch/German
    'benzalkonium', 'bak', 'chlorure de benzalkonium', 'benzalkoniumchloride',
  ],
  gelatin: [
    // From animal sources (relevant for vegetarians/vegans and religious restrictions)
    'gelatin', 'gélatine', 'gelatine',
  ],
  paraben: [
    // Preservatives that can cause sensitivities
    'paraben', 'parabène', 'methylparaben', 'propylparaben',
    'parahydroxybenzoate', 'méthylparabène', 'propylparabène',
  ],
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
 * Finds all allergens in excipient text content
 * (Excipients from SmPC are raw text blocks)
 */
export function findAllergensInExcipientText(excipientText: string): string[] {
  const foundAllergens = new Set<string>();
  const normalizedText = excipientText.toLowerCase();

  for (const [allergen, aliases] of Object.entries(COMMON_ALLERGENS)) {
    if (aliases.some((alias) => normalizedText.includes(alias))) {
      foundAllergens.add(allergen);
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

export interface MedicationWarningsOptions {
  /** Medication components with active ingredients */
  components: MedicationComponent[];
  /** User's excluded ingredients list */
  excludedIngredients?: string[];
  /** AMP code for excipient lookup (optional) */
  ampCode?: string;
}

export function getMedicationWarnings(
  componentsOrOptions: MedicationComponent[] | MedicationWarningsOptions,
  excludedIngredients: string[] = []
): MedicationWarning[] {
  // Support both old signature (components, excludedIngredients) and new signature (options object)
  let components: MedicationComponent[];
  let excluded: string[];
  let ampCode: string | undefined;

  if (Array.isArray(componentsOrOptions)) {
    // Old signature: getMedicationWarnings(components, excludedIngredients)
    components = componentsOrOptions;
    excluded = excludedIngredients;
    ampCode = undefined;
  } else {
    // New signature: getMedicationWarnings(options)
    components = componentsOrOptions.components;
    excluded = componentsOrOptions.excludedIngredients || [];
    ampCode = componentsOrOptions.ampCode;
  }

  const warnings: MedicationWarning[] = [];
  const foundAllergens = new Set<string>();

  // Check active ingredients for excluded items
  const excludedResult = containsExcludedIngredient(components, excluded);
  if (excludedResult.contains) {
    warnings.push({
      level: 'danger',
      type: 'excluded_ingredient',
      message: `Contains excluded ingredient(s): ${excludedResult.matches.join(', ')}`,
    });
  }

  // Check common allergens in active ingredients
  const allIngredients = components.flatMap((c) => c.ingredients);
  const ingredientAllergens = findAllergens(allIngredients);
  ingredientAllergens.forEach((a) => foundAllergens.add(a));

  // Check excipients from SmPC database (if ampCode provided)
  if (ampCode) {
    const excipientResult = getExcipients(ampCode);
    if (excipientResult && excipientResult.allTexts.length > 0) {
      // Combine all available language texts for allergen checking
      const allExcipientText = excipientResult.allTexts.map((t) => t.text).join('\n');

      // Check for excluded ingredients in excipients
      for (const excludedItem of excluded) {
        if (matchesAllergen(allExcipientText, excludedItem)) {
          warnings.push({
            level: 'danger',
            type: 'excluded_ingredient',
            message: `Excipients may contain excluded ingredient: ${excludedItem}`,
          });
        }
      }

      // Check for common allergens in excipients
      const excipientAllergens = findAllergensInExcipientText(allExcipientText);
      excipientAllergens.forEach((a) => foundAllergens.add(a));
    }
  }

  // Add allergen warnings (excluding those already in user's excluded list)
  for (const allergen of foundAllergens) {
    if (!excluded.some((e) => e.toLowerCase() === allergen.toLowerCase())) {
      warnings.push({
        level: 'info',
        type: 'allergen',
        message: `Contains common allergen: ${allergen}`,
      });
    }
  }

  return warnings;
}
