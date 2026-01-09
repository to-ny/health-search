import { describe, it, expect } from 'vitest';
import {
  matchesAllergen,
  findAllergens,
  containsExcludedIngredient,
  getMedicationWarnings,
} from '@/lib/utils/allergens';
import type { Ingredient, MedicationComponent } from '@/lib/types';

describe('Allergen Utilities', () => {
  describe('matchesAllergen', () => {
    it('should match exact allergen name', () => {
      expect(matchesAllergen('lactose', 'lactose')).toBe(true);
    });

    it('should match case insensitively', () => {
      expect(matchesAllergen('LACTOSE', 'lactose')).toBe(true);
      expect(matchesAllergen('Lactose Monohydrate', 'lactose')).toBe(true);
    });

    it('should match allergen aliases', () => {
      expect(matchesAllergen('wheat starch', 'gluten')).toBe(true);
      expect(matchesAllergen('soybean oil', 'soy')).toBe(true);
    });

    it('should not match unrelated ingredients', () => {
      expect(matchesAllergen('paracetamol', 'lactose')).toBe(false);
    });
  });

  describe('findAllergens', () => {
    it('should find common allergens in ingredients', () => {
      const ingredients: Ingredient[] = [
        { rank: 1, type: 'EXCIPIENT', substanceCode: 'S1', substanceName: 'Lactose monohydrate' },
        { rank: 2, type: 'EXCIPIENT', substanceCode: 'S2', substanceName: 'Wheat starch' },
      ];

      const allergens = findAllergens(ingredients);

      expect(allergens).toContain('lactose');
      expect(allergens).toContain('gluten');
    });

    it('should return empty array for no allergens', () => {
      const ingredients: Ingredient[] = [
        { rank: 1, type: 'ACTIVE', substanceCode: 'S1', substanceName: 'Paracetamol' },
      ];

      const allergens = findAllergens(ingredients);

      expect(allergens).toHaveLength(0);
    });
  });

  describe('containsExcludedIngredient', () => {
    const components: MedicationComponent[] = [
      {
        sequenceNr: 1,
        ingredients: [
          { rank: 1, type: 'ACTIVE', substanceCode: 'S1', substanceName: 'Ibuprofen' },
          { rank: 2, type: 'EXCIPIENT', substanceCode: 'S2', substanceName: 'Lactose' },
        ],
      },
    ];

    it('should detect excluded ingredients', () => {
      const result = containsExcludedIngredient(components, ['lactose']);

      expect(result.contains).toBe(true);
      expect(result.matches).toContain('Lactose');
    });

    it('should not flag non-excluded ingredients', () => {
      const result = containsExcludedIngredient(components, ['gluten']);

      expect(result.contains).toBe(false);
      expect(result.matches).toHaveLength(0);
    });
  });

  describe('getMedicationWarnings', () => {
    it('should warn about excluded ingredients', () => {
      const components: MedicationComponent[] = [
        {
          sequenceNr: 1,
          ingredients: [
            { rank: 1, type: 'EXCIPIENT', substanceCode: 'S1', substanceName: 'Lactose' },
          ],
        },
      ];

      const warnings = getMedicationWarnings(components, ['lactose']);

      expect(warnings.some((w) => w.level === 'danger')).toBe(true);
      expect(warnings.some((w) => w.type === 'excluded_ingredient')).toBe(true);
    });

    it('should warn about common allergens', () => {
      const components: MedicationComponent[] = [
        {
          sequenceNr: 1,
          ingredients: [
            { rank: 1, type: 'EXCIPIENT', substanceCode: 'S1', substanceName: 'Wheat starch' },
          ],
        },
      ];

      const warnings = getMedicationWarnings(components);

      expect(warnings.some((w) => w.type === 'allergen')).toBe(true);
      expect(warnings.some((w) => w.level === 'info')).toBe(true);
    });
  });
});
