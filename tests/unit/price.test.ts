import { describe, it, expect } from 'vitest';
import {
  formatPrice,
  calculateSavings,
  findCheapest,
  getPriceCategory,
} from '@/lib/utils/price';
import type { MedicationSearchResult } from '@/lib/types';

describe('Price Utilities', () => {
  describe('formatPrice', () => {
    it('should format price in euros', () => {
      const formatted = formatPrice(10.5, 'nl-BE');
      expect(formatted).toContain('10');
      expect(formatted).toContain('€');
    });

    it('should return N/A for undefined price', () => {
      expect(formatPrice(undefined)).toBe('N/A');
    });

    it('should handle zero price', () => {
      const formatted = formatPrice(0);
      expect(formatted).toContain('0');
    });
  });

  describe('calculateSavings', () => {
    it('should calculate savings amount and percentage', () => {
      const savings = calculateSavings(100, 80);

      expect(savings.amount).toBe(20);
      expect(savings.percentage).toBe(20);
    });

    it('should handle negative savings (price increase)', () => {
      const savings = calculateSavings(80, 100);

      expect(savings.amount).toBe(-20);
      expect(savings.percentage).toBe(-25);
    });

    it('should handle zero original price', () => {
      const savings = calculateSavings(0, 10);

      expect(savings.amount).toBe(-10);
      expect(savings.percentage).toBe(0);
    });
  });

  describe('findCheapest', () => {
    it('should find the cheapest medication', () => {
      const medications: MedicationSearchResult[] = [
        { ampCode: 'SAM1', name: 'Med A', price: 15, isReimbursed: false, status: 'AUTHORIZED' },
        { ampCode: 'SAM2', name: 'Med B', price: 10, isReimbursed: false, status: 'AUTHORIZED' },
        { ampCode: 'SAM3', name: 'Med C', price: 20, isReimbursed: false, status: 'AUTHORIZED' },
      ];

      const cheapest = findCheapest(medications);

      expect(cheapest?.ampCode).toBe('SAM2');
      expect(cheapest?.price).toBe(10);
    });

    it('should return undefined for empty array', () => {
      expect(findCheapest([])).toBeUndefined();
    });

    it('should skip medications without price', () => {
      const medications: MedicationSearchResult[] = [
        { ampCode: 'SAM1', name: 'Med A', isReimbursed: false, status: 'AUTHORIZED' },
        { ampCode: 'SAM2', name: 'Med B', price: 10, isReimbursed: false, status: 'AUTHORIZED' },
      ];

      const cheapest = findCheapest(medications);

      expect(cheapest?.ampCode).toBe('SAM2');
    });
  });

  describe('getPriceCategory', () => {
    it('should return cheap for low prices', () => {
      expect(getPriceCategory(3)).toBe('cheap');
      expect(getPriceCategory(5)).toBe('cheap');
    });

    it('should return moderate for medium prices', () => {
      expect(getPriceCategory(10)).toBe('moderate');
      expect(getPriceCategory(15)).toBe('moderate');
    });

    it('should return expensive for high prices', () => {
      expect(getPriceCategory(20)).toBe('expensive');
      expect(getPriceCategory(100)).toBe('expensive');
    });

    it('should return moderate for undefined', () => {
      expect(getPriceCategory(undefined)).toBe('moderate');
    });
  });
});
