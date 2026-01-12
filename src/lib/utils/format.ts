/**
 * Formatting utilities for display values
 */

/**
 * CNK code length - Belgian medication identifiers are 7 digits
 */
const CNK_CODE_LENGTH = 7;

/**
 * Normalizes a CNK code by padding with leading zeros to 7 digits
 * Returns the original string if it's not a valid numeric CNK input
 *
 * @param id - The CNK code to normalize (e.g., "14845" or "0014845")
 * @returns Normalized 7-digit CNK code (e.g., "0014845") or original string if not numeric
 */
export function normalizeCnk(id: string): string {
  // Only normalize if the input is purely numeric and not longer than 7 digits
  if (/^\d{1,7}$/.test(id)) {
    return id.padStart(CNK_CODE_LENGTH, '0');
  }
  return id;
}

/**
 * Converts UPPERCASE_ENUM values to readable Title Case
 * Examples:
 *   AUTHORIZED -> Authorized
 *   ACTIVE_SUBSTANCE -> Active Substance
 *   IN_PROGRESS -> In Progress
 */
export function formatEnumValue(value: string | undefined): string {
  if (!value) return '';

  return value
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Country data with flag emojis and full names
 */
const COUNTRIES: Record<string, { flag: string; name: string }> = {
  BE: { flag: '🇧🇪', name: 'Belgium' },
  NL: { flag: '🇳🇱', name: 'Netherlands' },
  FR: { flag: '🇫🇷', name: 'France' },
  DE: { flag: '🇩🇪', name: 'Germany' },
  LU: { flag: '🇱🇺', name: 'Luxembourg' },
  GB: { flag: '🇬🇧', name: 'United Kingdom' },
  UK: { flag: '🇬🇧', name: 'United Kingdom' },
  US: { flag: '🇺🇸', name: 'United States' },
  CH: { flag: '🇨🇭', name: 'Switzerland' },
  AT: { flag: '🇦🇹', name: 'Austria' },
  IT: { flag: '🇮🇹', name: 'Italy' },
  ES: { flag: '🇪🇸', name: 'Spain' },
  PT: { flag: '🇵🇹', name: 'Portugal' },
  IE: { flag: '🇮🇪', name: 'Ireland' },
  DK: { flag: '🇩🇰', name: 'Denmark' },
  SE: { flag: '🇸🇪', name: 'Sweden' },
  NO: { flag: '🇳🇴', name: 'Norway' },
  FI: { flag: '🇫🇮', name: 'Finland' },
  PL: { flag: '🇵🇱', name: 'Poland' },
  CZ: { flag: '🇨🇿', name: 'Czech Republic' },
  IN: { flag: '🇮🇳', name: 'India' },
  CN: { flag: '🇨🇳', name: 'China' },
  JP: { flag: '🇯🇵', name: 'Japan' },
  AU: { flag: '🇦🇺', name: 'Australia' },
  CA: { flag: '🇨🇦', name: 'Canada' },
};

/**
 * Gets country display info from ISO country code
 * Returns flag emoji and full name
 */
export function getCountryDisplay(countryCode: string | undefined): { flag: string; name: string } {
  if (!countryCode) return { flag: '', name: '' };

  const code = countryCode.toUpperCase();
  return COUNTRIES[code] || { flag: '', name: countryCode };
}

/**
 * Formats country code as "flag Name" (e.g., "🇧🇪 Belgium")
 */
export function formatCountry(countryCode: string | undefined): string {
  if (!countryCode) return '';

  const { flag, name } = getCountryDisplay(countryCode);
  return flag ? `${flag} ${name}` : name;
}

/**
 * Language data with full names
 */
const LANGUAGES: Record<string, string> = {
  en: 'English',
  nl: 'Dutch',
  fr: 'French',
  de: 'German',
  es: 'Spanish',
  it: 'Italian',
  pt: 'Portuguese',
  pl: 'Polish',
  cs: 'Czech',
  da: 'Danish',
  sv: 'Swedish',
  no: 'Norwegian',
  fi: 'Finnish',
  ja: 'Japanese',
  zh: 'Chinese',
  ko: 'Korean',
  ar: 'Arabic',
  ru: 'Russian',
};

/**
 * Formats language code to full name (e.g., "fr" -> "French")
 */
export function formatLanguage(languageCode: string | undefined): string {
  if (!languageCode) return '';

  const code = languageCode.toLowerCase();
  return LANGUAGES[code] || languageCode.toUpperCase();
}

/**
 * Mapping of SAM pharmaceutical form names to simplified unit keys
 * These keys correspond to translation keys in packSizeUnits
 */
const FORM_TO_UNIT_KEY: Record<string, string> = {
  // Tablets
  'tablet': 'tablet',
  'film-coated tablet': 'tablet',
  'coated tablet': 'tablet',
  'effervescent tablet': 'tablet',
  'orodispersible tablet': 'tablet',
  'chewable tablet': 'tablet',
  'gastro-resistant tablet': 'tablet',
  'prolonged-release tablet': 'tablet',
  'modified-release tablet': 'tablet',
  'sublingual tablet': 'tablet',
  'buccal tablet': 'tablet',
  'dispersible tablet': 'tablet',
  'soluble tablet': 'tablet',
  'vaginal tablet': 'tablet',
  'lozenge': 'tablet',

  // Capsules
  'capsule': 'capsule',
  'capsule, hard': 'capsule',
  'capsule, soft': 'capsule',
  'gastro-resistant capsule': 'capsule',
  'gastro-resistant capsule, hard': 'capsule',
  'gastro-resistant capsule, soft': 'capsule',
  'prolonged-release capsule': 'capsule',
  'modified-release capsule': 'capsule',

  // Suppositories
  'suppository': 'suppository',
  'rectal suppository': 'suppository',
  'vaginal suppository': 'suppository',

  // Sachets
  'sachet': 'sachet',
  'powder in sachet': 'sachet',
  'granules in sachet': 'sachet',
  'oral powder in sachet': 'sachet',

  // Patches
  'patch': 'patch',
  'transdermal patch': 'patch',
  'patch, transdermal': 'patch',
  'medicated plaster': 'patch',

  // Doses (for inhalers, sprays)
  'dose': 'dose',
  'pressurised inhalation': 'dose',
  'inhalation powder': 'dose',
  'inhalation vapour': 'dose',
  'nasal spray': 'dose',
  'oromucosal spray': 'dose',

  // Ampoules
  'ampoule': 'ampoule',
  'solution for injection': 'ampoule',
  'solution for infusion': 'ampoule',
  'suspension for injection': 'ampoule',
  'emulsion for injection': 'ampoule',
  'concentrate for solution for infusion': 'ampoule',

  // Vials
  'vial': 'vial',
  'powder for solution for injection': 'vial',
  'powder for suspension for injection': 'vial',
  'powder for concentrate for solution for infusion': 'vial',
  'lyophilisate for solution for injection': 'vial',

  // Pens
  'pen': 'pen',
  'solution for injection in pre-filled pen': 'pen',
  'suspension for injection in pre-filled pen': 'pen',

  // Syringes
  'syringe': 'syringe',
  'solution for injection in pre-filled syringe': 'syringe',
  'suspension for injection in pre-filled syringe': 'syringe',

  // Inhalers
  'inhaler': 'inhaler',
  'inhalation powder, pre-dispensed': 'inhaler',

  // Implants
  'implant': 'implant',
};

/**
 * Result of parsing a pack display value
 */
export interface PackSizeInfo {
  /** If true, display the raw value as-is (already has units) */
  displayRaw: boolean;
  /** The raw value to display if displayRaw is true */
  rawValue: string;
  /** The numeric count (if displayRaw is false) */
  count?: number;
  /** The unit key for translation (if displayRaw is false) */
  unitKey?: string;
}

/**
 * Parses pack display value and pharmaceutical form to determine how to display it
 *
 * @param packDisplayValue - The raw pack value (e.g., "30", "20 x 10 ml")
 * @param pharmaceuticalForm - The pharmaceutical form name (e.g., "film-coated tablet")
 * @returns PackSizeInfo with display instructions
 */
export function parsePackSize(
  packDisplayValue: string | number | undefined,
  pharmaceuticalForm: string | undefined
): PackSizeInfo {
  if (packDisplayValue === undefined || packDisplayValue === null || packDisplayValue === '') {
    return { displayRaw: true, rawValue: '' };
  }

  // Convert to string - SAM API can return numbers
  const trimmed = String(packDisplayValue).trim();

  // Check if it already contains letters (units like "ml", "g", "x")
  // Regex: contains any letter
  if (/[a-zA-Z]/.test(trimmed)) {
    return { displayRaw: true, rawValue: trimmed };
  }

  // It's just a number - try to add the unit from pharmaceutical form
  const count = parseInt(trimmed, 10);
  if (isNaN(count)) {
    return { displayRaw: true, rawValue: trimmed };
  }

  // Find the unit key from the pharmaceutical form
  if (pharmaceuticalForm) {
    const formLower = pharmaceuticalForm.toLowerCase();

    // Try exact match first
    let unitKey = FORM_TO_UNIT_KEY[formLower];

    // If no exact match, try partial matching
    if (!unitKey) {
      for (const [formPattern, key] of Object.entries(FORM_TO_UNIT_KEY)) {
        if (formLower.includes(formPattern) || formPattern.includes(formLower)) {
          unitKey = key;
          break;
        }
      }
    }

    if (unitKey) {
      return { displayRaw: false, rawValue: trimmed, count, unitKey };
    }
  }

  // Fallback to generic "unit" if we have a number but couldn't determine the form
  return { displayRaw: false, rawValue: trimmed, count, unitKey: 'unit' };
}
