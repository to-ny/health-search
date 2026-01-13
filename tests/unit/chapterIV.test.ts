import { describe, it, expect } from 'vitest';
import {
  isChapterIVPath,
  isChapterIV,
  hasChapterIVReimbursement,
  getChapterIVInfoUrl,
  CHAPTER_IV_INFO_URLS,
} from '@/lib/utils/chapterIV';
import { getLocalizedText, getVerseSummary } from '@/lib/services/chapterIV';
import type { Reimbursement, ChapterIVVerse, LocalizedText } from '@/lib/types';

// Helper to create minimal Reimbursement test fixtures
function createReimbursement(legalReferencePath?: string): Reimbursement {
  return {
    cnk: '1234567',
    deliveryEnvironment: 'P',
    copayments: [],
    legalReferencePath,
  };
}

describe('Chapter IV Utilities', () => {
  describe('isChapterIVPath', () => {
    it('should return true for paths containing "-IV-"', () => {
      // Real examples from SAM API
      expect(isChapterIVPath('RD20180201-IV-8870000')).toBe(true);
      expect(isChapterIVPath('RD20180201-IV-4870000')).toBe(true);
      expect(isChapterIVPath('RD20180201-IV-10680000')).toBe(true);
    });

    it('should return false for paths with other chapters', () => {
      // Real examples from SAM API
      expect(isChapterIVPath('RD20180201-II-70000')).toBe(false);
      expect(isChapterIVPath('RD20180201-III-50000')).toBe(false);
      expect(isChapterIVPath('RD20180201-I-10000')).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isChapterIVPath(undefined)).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(isChapterIVPath('')).toBe(false);
    });

    it('should not match partial "IV" strings', () => {
      // Ensure we're matching the chapter segment, not random text
      expect(isChapterIVPath('RD20180201-INVALID-123')).toBe(false);
      expect(isChapterIVPath('RDIV20180201-II-70000')).toBe(false);
    });
  });

  describe('isChapterIV', () => {
    it('should return true for reimbursement with Chapter IV path', () => {
      const reimbursement = createReimbursement('RD20180201-IV-8870000');
      expect(isChapterIV(reimbursement)).toBe(true);
    });

    it('should return false for reimbursement with non-Chapter IV path', () => {
      const reimbursement = createReimbursement('RD20180201-II-70000');
      expect(isChapterIV(reimbursement)).toBe(false);
    });

    it('should return false for reimbursement without legalReferencePath', () => {
      const reimbursement = createReimbursement(undefined);
      expect(isChapterIV(reimbursement)).toBe(false);
    });

    it('should return false for undefined reimbursement', () => {
      expect(isChapterIV(undefined)).toBe(false);
    });

    it('should return false for null reimbursement', () => {
      expect(isChapterIV(null)).toBe(false);
    });
  });

  describe('hasChapterIVReimbursement', () => {
    it('should return true if any reimbursement is Chapter IV', () => {
      const reimbursements: Reimbursement[] = [
        createReimbursement('RD20180201-II-70000'),
        createReimbursement('RD20180201-IV-8870000'),
      ];

      expect(hasChapterIVReimbursement(reimbursements)).toBe(true);
    });

    it('should return false if no reimbursements are Chapter IV', () => {
      const reimbursements: Reimbursement[] = [
        createReimbursement('RD20180201-II-70000'),
        createReimbursement('RD20180201-III-50000'),
      ];

      expect(hasChapterIVReimbursement(reimbursements)).toBe(false);
    });

    it('should return false for empty array', () => {
      expect(hasChapterIVReimbursement([])).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(hasChapterIVReimbursement(undefined)).toBe(false);
    });

    it('should return false for null', () => {
      expect(hasChapterIVReimbursement(null)).toBe(false);
    });
  });

  describe('getChapterIVInfoUrl', () => {
    it('should return Dutch RIZIV URL for "nl"', () => {
      const url = getChapterIVInfoUrl('nl');
      expect(url).toBe(CHAPTER_IV_INFO_URLS.nl);
      expect(url).toContain('riziv.fgov.be/nl');
    });

    it('should return French INAMI URL for "fr"', () => {
      const url = getChapterIVInfoUrl('fr');
      expect(url).toBe(CHAPTER_IV_INFO_URLS.fr);
      expect(url).toContain('inami.fgov.be/fr');
    });

    it('should return German fallback URL for "de"', () => {
      const url = getChapterIVInfoUrl('de');
      expect(url).toBe(CHAPTER_IV_INFO_URLS.de);
    });

    it('should return English fallback URL for "en"', () => {
      const url = getChapterIVInfoUrl('en');
      expect(url).toBe(CHAPTER_IV_INFO_URLS.en);
    });

    it('should handle uppercase language codes', () => {
      const url = getChapterIVInfoUrl('NL');
      expect(url).toBe(CHAPTER_IV_INFO_URLS.nl);
    });

    it('should return English fallback for unknown language', () => {
      const url = getChapterIVInfoUrl('es');
      expect(url).toBe(CHAPTER_IV_INFO_URLS.en);
    });
  });
});

describe('Chapter IV Service', () => {
  describe('getLocalizedText', () => {
    const sampleTexts: LocalizedText[] = [
      { text: 'Dutch text', language: 'nl' },
      { text: 'French text', language: 'fr' },
      { text: 'English text', language: 'en' },
    ];

    it('should return text for preferred language', () => {
      expect(getLocalizedText(sampleTexts, 'nl')).toBe('Dutch text');
      expect(getLocalizedText(sampleTexts, 'fr')).toBe('French text');
      expect(getLocalizedText(sampleTexts, 'en')).toBe('English text');
    });

    it('should fall back to English when preferred language not found', () => {
      expect(getLocalizedText(sampleTexts, 'de')).toBe('English text');
    });

    it('should fall back to first available when no English', () => {
      const noEnglish: LocalizedText[] = [
        { text: 'Dutch only', language: 'nl' },
        { text: 'French only', language: 'fr' },
      ];

      expect(getLocalizedText(noEnglish, 'de')).toBe('Dutch only');
    });

    it('should return empty string for undefined input', () => {
      expect(getLocalizedText(undefined)).toBe('');
    });

    it('should return empty string for empty array', () => {
      expect(getLocalizedText([])).toBe('');
    });
  });

  describe('getVerseSummary', () => {
    const sampleVerses: ChapterIVVerse[] = [
      {
        verseSeq: 1,
        verseNum: 100,
        verseSeqParent: 0,
        verseLevel: 1,
        text: [{ text: 'Top level verse', language: 'en' }],
      },
      {
        verseSeq: 2,
        verseNum: 101,
        verseSeqParent: 1,
        verseLevel: 2,
        text: [{ text: 'Second level verse', language: 'en' }],
      },
      {
        verseSeq: 3,
        verseNum: 102,
        verseSeqParent: 2,
        verseLevel: 3,
        text: [{ text: 'Third level verse', language: 'en' }],
      },
    ];

    it('should return only top-level verses (level <= 2)', () => {
      const summary = getVerseSummary(sampleVerses, 'en');

      expect(summary).toHaveLength(2);
      expect(summary).toContain('Top level verse');
      expect(summary).toContain('Second level verse');
      expect(summary).not.toContain('Third level verse');
    });

    it('should filter out empty text', () => {
      const withEmpty: ChapterIVVerse[] = [
        ...sampleVerses,
        {
          verseSeq: 4,
          verseNum: 103,
          verseSeqParent: 0,
          verseLevel: 1,
          text: [{ text: '', language: 'en' }],
        },
      ];

      const summary = getVerseSummary(withEmpty, 'en');
      expect(summary).toHaveLength(2);
    });

    it('should return empty array for no verses', () => {
      expect(getVerseSummary([], 'en')).toEqual([]);
    });

    it('should use preferred language', () => {
      const multiLang: ChapterIVVerse[] = [
        {
          verseSeq: 1,
          verseNum: 100,
          verseSeqParent: 0,
          verseLevel: 1,
          text: [
            { text: 'English verse', language: 'en' },
            { text: 'Dutch verse', language: 'nl' },
          ],
        },
      ];

      expect(getVerseSummary(multiLang, 'nl')).toEqual(['Dutch verse']);
      expect(getVerseSummary(multiLang, 'en')).toEqual(['English verse']);
    });
  });
});
