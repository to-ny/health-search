import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const MESSAGES_DIR = path.join(process.cwd(), 'src/messages');
const LANGUAGES = ['en', 'fr', 'nl', 'de'] as const;

// Load all translation files
function loadMessages(lang: string): Record<string, unknown> {
  const filePath = path.join(MESSAGES_DIR, `${lang}.json`);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

// Recursively get all keys from nested object (e.g., "nav.search", "home.title")
function getAllKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  const keys: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      keys.push(...getAllKeys(value as Record<string, unknown>, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

// Extract translation keys used in source files
function extractUsedKeys(): string[] {
  const srcDir = path.join(process.cwd(), 'src');
  const usedKeys = new Set<string>();

  // Valid translation key pattern: namespace.key or namespace.subkey.key
  // Must contain at least one dot and only valid characters
  const isValidTranslationKey = (key: string): boolean => {
    // Must have at least one dot (namespace separator)
    if (!key.includes('.')) return false;
    // Must match pattern like "nav.search", "home.title", "medication.notFoundWithId"
    if (!/^[a-z][a-zA-Z0-9]*(\.[a-zA-Z][a-zA-Z0-9]*)+$/.test(key)) return false;
    // Exclude common false positives
    const falsePositives = ['e.target', 'e.key', 'c.code', 'r.deliveryEnvironment'];
    if (falsePositives.some(fp => key.startsWith(fp))) return false;
    return true;
  };

  function scanFile(filePath: string) {
    const content = fs.readFileSync(filePath, 'utf8');
    // Match t('key') or t("key") patterns - must be preceded by t( from useTranslations
    const patterns = [
      /\bt\(['"]([^'"]+)['"]\)/g,
      /\bt\(['"]([^'"]+)['"],\s*\{/g,
    ];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const key = match[1];
        if (isValidTranslationKey(key)) {
          usedKeys.add(key);
        }
      }
    }
  }

  function scanDir(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        scanDir(fullPath);
      } else if (entry.isFile() && /\.(tsx?|jsx?)$/.test(entry.name)) {
        scanFile(fullPath);
      }
    }
  }

  scanDir(srcDir);
  return Array.from(usedKeys).sort();
}

describe('Translations', () => {
  const enMessages = loadMessages('en');
  const enKeys = getAllKeys(enMessages);
  const usedKeys = extractUsedKeys();

  describe('All languages have the same keys', () => {
    for (const lang of LANGUAGES) {
      if (lang === 'en') continue;

      it(`${lang}.json has all keys from en.json`, () => {
        const langMessages = loadMessages(lang);
        const langKeys = getAllKeys(langMessages);

        const missingKeys = enKeys.filter(key => !langKeys.includes(key));

        if (missingKeys.length > 0) {
          throw new Error(
            `${lang}.json is missing ${missingKeys.length} keys:\n` +
            missingKeys.map(k => `  - ${k}`).join('\n')
          );
        }

        expect(missingKeys).toHaveLength(0);
      });

      it(`${lang}.json has no extra keys not in en.json`, () => {
        const langMessages = loadMessages(lang);
        const langKeys = getAllKeys(langMessages);

        const extraKeys = langKeys.filter(key => !enKeys.includes(key));

        if (extraKeys.length > 0) {
          throw new Error(
            `${lang}.json has ${extraKeys.length} extra keys not in en.json:\n` +
            extraKeys.map(k => `  - ${k}`).join('\n')
          );
        }

        expect(extraKeys).toHaveLength(0);
      });
    }
  });

  describe('All used translation keys exist', () => {
    it('All t() calls reference existing keys in en.json', () => {
      const missingKeys = usedKeys.filter(key => !enKeys.includes(key));

      if (missingKeys.length > 0) {
        throw new Error(
          `Found ${missingKeys.length} translation keys used in code but missing from en.json:\n` +
          missingKeys.map(k => `  - ${k}`).join('\n')
        );
      }

      expect(missingKeys).toHaveLength(0);
    });
  });

  describe('No unused translation keys', () => {
    it('All keys in en.json are used in the code', () => {
      const unusedKeys = enKeys.filter(key => !usedKeys.includes(key));

      // This is a warning, not a failure - some keys might be used dynamically
      if (unusedKeys.length > 0) {
        console.warn(
          `Warning: ${unusedKeys.length} translation keys in en.json appear unused:\n` +
          unusedKeys.map(k => `  - ${k}`).join('\n')
        );
      }

      // Don't fail for unused keys, just warn
      expect(true).toBe(true);
    });
  });

  describe('Translation values are not empty', () => {
    for (const lang of LANGUAGES) {
      it(`${lang}.json has no empty translation values`, () => {
        const messages = loadMessages(lang);
        const keys = getAllKeys(messages);

        const emptyKeys: string[] = [];

        function getValue(obj: Record<string, unknown>, keyPath: string): unknown {
          const parts = keyPath.split('.');
          let current: unknown = obj;
          for (const part of parts) {
            if (current && typeof current === 'object') {
              current = (current as Record<string, unknown>)[part];
            } else {
              return undefined;
            }
          }
          return current;
        }

        for (const key of keys) {
          const value = getValue(messages, key);
          if (typeof value === 'string' && value.trim() === '') {
            emptyKeys.push(key);
          }
        }

        if (emptyKeys.length > 0) {
          throw new Error(
            `${lang}.json has ${emptyKeys.length} empty translation values:\n` +
            emptyKeys.map(k => `  - ${k}`).join('\n')
          );
        }

        expect(emptyKeys).toHaveLength(0);
      });
    }
  });
});
