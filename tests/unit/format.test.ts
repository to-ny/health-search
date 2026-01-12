import { describe, it, expect } from 'vitest';
import { formatEnumValue, formatCountry, getCountryDisplay, formatLanguage, parsePackSize, normalizeCnk } from '@/lib/utils/format';

describe('formatEnumValue', () => {
  it('converts UPPERCASE to Title Case', () => {
    expect(formatEnumValue('AUTHORIZED')).toBe('Authorized');
  });

  it('converts SNAKE_CASE to Title Case with spaces', () => {
    expect(formatEnumValue('ACTIVE_SUBSTANCE')).toBe('Active Substance');
    expect(formatEnumValue('IN_PROGRESS')).toBe('In Progress');
  });

  it('handles single word', () => {
    expect(formatEnumValue('PENDING')).toBe('Pending');
  });

  it('handles empty string', () => {
    expect(formatEnumValue('')).toBe('');
  });

  it('handles undefined', () => {
    expect(formatEnumValue(undefined)).toBe('');
  });

  it('handles multiple underscores', () => {
    expect(formatEnumValue('VERY_LONG_ENUM_VALUE')).toBe('Very Long Enum Value');
  });
});

describe('getCountryDisplay', () => {
  it('returns flag and name for known country codes', () => {
    expect(getCountryDisplay('BE')).toEqual({ flag: '🇧🇪', name: 'Belgium' });
    expect(getCountryDisplay('NL')).toEqual({ flag: '🇳🇱', name: 'Netherlands' });
    expect(getCountryDisplay('FR')).toEqual({ flag: '🇫🇷', name: 'France' });
    expect(getCountryDisplay('DE')).toEqual({ flag: '🇩🇪', name: 'Germany' });
  });

  it('handles lowercase country codes', () => {
    expect(getCountryDisplay('be')).toEqual({ flag: '🇧🇪', name: 'Belgium' });
  });

  it('returns code as name for unknown countries', () => {
    expect(getCountryDisplay('XX')).toEqual({ flag: '', name: 'XX' });
  });

  it('handles empty/undefined input', () => {
    expect(getCountryDisplay('')).toEqual({ flag: '', name: '' });
    expect(getCountryDisplay(undefined)).toEqual({ flag: '', name: '' });
  });
});

describe('formatCountry', () => {
  it('formats known countries with flag and name', () => {
    expect(formatCountry('BE')).toBe('🇧🇪 Belgium');
    expect(formatCountry('NL')).toBe('🇳🇱 Netherlands');
  });

  it('returns just name for unknown countries', () => {
    expect(formatCountry('XX')).toBe('XX');
  });

  it('handles empty input', () => {
    expect(formatCountry('')).toBe('');
    expect(formatCountry(undefined)).toBe('');
  });
});

describe('formatLanguage', () => {
  it('formats known language codes to full names', () => {
    expect(formatLanguage('en')).toBe('English');
    expect(formatLanguage('nl')).toBe('Dutch');
    expect(formatLanguage('fr')).toBe('French');
    expect(formatLanguage('de')).toBe('German');
  });

  it('handles uppercase language codes', () => {
    expect(formatLanguage('EN')).toBe('English');
    expect(formatLanguage('FR')).toBe('French');
  });

  it('returns uppercase code for unknown languages', () => {
    expect(formatLanguage('xx')).toBe('XX');
  });

  it('handles empty/undefined input', () => {
    expect(formatLanguage('')).toBe('');
    expect(formatLanguage(undefined)).toBe('');
  });
});

describe('parsePackSize', () => {
  describe('values with existing units (displayRaw = true)', () => {
    it('returns raw value for values containing letters', () => {
      expect(parsePackSize('20 x 10 ml', undefined)).toEqual({
        displayRaw: true,
        rawValue: '20 x 10 ml',
      });
    });

    it('returns raw value for complex formats', () => {
      expect(parsePackSize('40 x 100 ml Viaflo', undefined)).toEqual({
        displayRaw: true,
        rawValue: '40 x 100 ml Viaflo',
      });
    });

    it('returns raw value for values with "x" multiplier', () => {
      expect(parsePackSize('10 x 50 ml', undefined)).toEqual({
        displayRaw: true,
        rawValue: '10 x 50 ml',
      });
    });
  });

  describe('numeric values with pharmaceutical form', () => {
    it('parses tablets', () => {
      const result = parsePackSize('30', 'film-coated tablet');
      expect(result.displayRaw).toBe(false);
      expect(result.count).toBe(30);
      expect(result.unitKey).toBe('tablet');
    });

    it('parses capsules', () => {
      const result = parsePackSize('60', 'capsule, hard');
      expect(result.displayRaw).toBe(false);
      expect(result.count).toBe(60);
      expect(result.unitKey).toBe('capsule');
    });

    it('parses suppositories', () => {
      const result = parsePackSize('10', 'suppository');
      expect(result.displayRaw).toBe(false);
      expect(result.count).toBe(10);
      expect(result.unitKey).toBe('suppository');
    });

    it('parses sachets', () => {
      const result = parsePackSize('20', 'powder in sachet');
      expect(result.displayRaw).toBe(false);
      expect(result.count).toBe(20);
      expect(result.unitKey).toBe('sachet');
    });

    it('parses patches', () => {
      const result = parsePackSize('7', 'transdermal patch');
      expect(result.displayRaw).toBe(false);
      expect(result.count).toBe(7);
      expect(result.unitKey).toBe('patch');
    });

    it('parses pre-filled syringes', () => {
      const result = parsePackSize('6', 'solution for injection in pre-filled syringe');
      expect(result.displayRaw).toBe(false);
      expect(result.count).toBe(6);
      expect(result.unitKey).toBe('syringe');
    });

    it('parses pre-filled pens', () => {
      const result = parsePackSize('5', 'solution for injection in pre-filled pen');
      expect(result.displayRaw).toBe(false);
      expect(result.count).toBe(5);
      expect(result.unitKey).toBe('pen');
    });
  });

  describe('fallback behavior', () => {
    it('uses generic "unit" when form is unknown', () => {
      const result = parsePackSize('100', 'some unknown form');
      expect(result.displayRaw).toBe(false);
      expect(result.count).toBe(100);
      expect(result.unitKey).toBe('unit');
    });

    it('uses generic "unit" when form is undefined', () => {
      const result = parsePackSize('50', undefined);
      expect(result.displayRaw).toBe(false);
      expect(result.count).toBe(50);
      expect(result.unitKey).toBe('unit');
    });
  });

  describe('edge cases', () => {
    it('handles empty packDisplayValue', () => {
      expect(parsePackSize('', undefined)).toEqual({
        displayRaw: true,
        rawValue: '',
      });
    });

    it('handles undefined packDisplayValue', () => {
      expect(parsePackSize(undefined, undefined)).toEqual({
        displayRaw: true,
        rawValue: '',
      });
    });

    it('handles whitespace', () => {
      const result = parsePackSize('  30  ', 'tablet');
      expect(result.displayRaw).toBe(false);
      expect(result.count).toBe(30);
      expect(result.unitKey).toBe('tablet');
    });

    it('handles single digit', () => {
      const result = parsePackSize('1', 'tablet');
      expect(result.displayRaw).toBe(false);
      expect(result.count).toBe(1);
      expect(result.unitKey).toBe('tablet');
    });

    it('handles numeric input (number type, not string)', () => {
      const result = parsePackSize(30 as unknown as string, 'tablet');
      expect(result.displayRaw).toBe(false);
      expect(result.count).toBe(30);
      expect(result.unitKey).toBe('tablet');
    });

    it('handles numeric input without form', () => {
      const result = parsePackSize(100 as unknown as string, undefined);
      expect(result.displayRaw).toBe(false);
      expect(result.count).toBe(100);
      expect(result.unitKey).toBe('unit');
    });
  });
});

describe('normalizeCnk', () => {
  describe('pads numeric CNK codes to 7 digits', () => {
    it('pads 5-digit CNK to 7 digits', () => {
      expect(normalizeCnk('14845')).toBe('0014845');
    });

    it('pads 6-digit CNK to 7 digits', () => {
      expect(normalizeCnk('148450')).toBe('0148450');
    });

    it('pads 1-digit CNK to 7 digits', () => {
      expect(normalizeCnk('1')).toBe('0000001');
    });

    it('keeps 7-digit CNK unchanged', () => {
      expect(normalizeCnk('0014845')).toBe('0014845');
      expect(normalizeCnk('1234567')).toBe('1234567');
    });
  });

  describe('returns original string for non-CNK inputs', () => {
    it('returns SAM codes unchanged', () => {
      expect(normalizeCnk('SAM123456-01')).toBe('SAM123456-01');
    });

    it('returns codes longer than 7 digits unchanged', () => {
      expect(normalizeCnk('12345678')).toBe('12345678');
    });

    it('returns alphanumeric strings unchanged', () => {
      expect(normalizeCnk('abc123')).toBe('abc123');
    });

    it('returns empty string unchanged', () => {
      expect(normalizeCnk('')).toBe('');
    });

    it('returns strings with special characters unchanged', () => {
      expect(normalizeCnk('123-456')).toBe('123-456');
    });
  });
});
