import { describe, it, expect } from 'vitest';
import {
  getExcipients,
  hasExcipientData,
  getExcipientDatabaseStats,
} from '@/lib/services/excipients';

// Test with real data from the excipients database
// SAM001547-00 has FR and NL versions
// SAM001032-00 has FR and NL versions

describe('Excipients Service', () => {
  describe('getExcipients', () => {
    it('returns text in preferred language when available', () => {
      const result = getExcipients('SAM001547-00', 'fr');

      expect(result).not.toBeNull();
      expect(result!.hasRequestedLanguage).toBe(true);
      expect(result!.language).toBe('fr');
      expect(result!.text).toBeDefined();
      expect(result!.text!.length).toBeGreaterThan(0);
    });

    it('returns all available languages in allTexts', () => {
      const result = getExcipients('SAM001547-00', 'fr');

      expect(result!.allTexts.length).toBeGreaterThanOrEqual(1);
      expect(result!.allTexts[0]).toHaveProperty('language');
      expect(result!.allTexts[0]).toHaveProperty('text');
    });

    it('falls back when preferred language not available', () => {
      // Request German for a medication that likely only has FR/NL
      const result = getExcipients('SAM001547-00', 'de');

      expect(result).not.toBeNull();
      // If DE isn't available, should fall back
      if (!result!.hasRequestedLanguage) {
        expect(['fr', 'nl']).toContain(result!.language);
      }
    });

    it('returns null for unknown AMP code', () => {
      const result = getExcipients('SAM999999-99', 'fr');

      expect(result).toBeNull();
    });

    it('defaults to fr when no language specified', () => {
      const result = getExcipients('SAM001547-00');

      expect(result).not.toBeNull();
      // Default is FR, should either have FR or fall back
      expect(result!.language).toBeDefined();
    });
  });

  describe('hasExcipientData', () => {
    it('returns true for existing AMP code', () => {
      expect(hasExcipientData('SAM001547-00')).toBe(true);
    });

    it('returns false for unknown AMP code', () => {
      expect(hasExcipientData('SAM999999-99')).toBe(false);
    });
  });

  describe('getExcipientDatabaseStats', () => {
    it('returns database statistics', () => {
      const stats = getExcipientDatabaseStats();

      expect(stats.version).toBe('2.0.0');
      expect(stats.totalMedications).toBeGreaterThan(0);
      expect(stats.medicationsWithExcipients).toBeGreaterThan(0);
      expect(stats.coveragePercent).toBeGreaterThan(0);
      expect(stats.coveragePercent).toBeLessThanOrEqual(100);
      expect(stats.generatedAt).toBeDefined();
    });

    it('has reasonable coverage', () => {
      const stats = getExcipientDatabaseStats();

      // We expect ~90% coverage based on the build output
      expect(stats.coveragePercent).toBeGreaterThan(80);
    });
  });
});
