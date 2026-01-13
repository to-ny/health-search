/**
 * Chapter IV service
 * Handles Chapter IV (prior authorization) paragraph details for restricted medications
 */

import { soapRequest } from '@/lib/soap/client';
import { buildFindChapterIVRequest } from '@/lib/soap/xml-builder';
import {
  parseFindChapterIVResponse,
  extractAllTextVersions,
  type RawChapterIVParagraphData,
  type RawChapterIVVerseData,
} from '@/lib/soap/xml-parser';
import type { ChapterIVParagraph, ChapterIVVerse, LocalizedText, ApiResponse } from '@/lib/types';

/**
 * Transforms raw verse data to our typed format
 */
function transformVerse(raw: RawChapterIVVerseData): ChapterIVVerse {
  // Extract text from nested structure
  const textElements = raw.Text?.Text;
  const textVersions = extractAllTextVersions(textElements);

  return {
    verseSeq: raw['@_VerseSeq'] ?? 0,
    verseNum: raw.VerseNum ?? 0,
    verseSeqParent: raw.VerseSeqParent ?? 0,
    verseLevel: raw.VerseLevel ?? 1,
    text: textVersions.map((t) => ({ text: t.text, language: t.language })),
    requestType: raw.RequestType,
    agreementTermQuantity: raw.AgreementTerm?.Quantity,
    agreementTermUnit: raw.AgreementTerm?.Unit,
    startDate: raw['@_StartDate'],
  };
}

/**
 * Transforms raw paragraph data to our typed format
 */
function transformParagraph(raw: RawChapterIVParagraphData): ChapterIVParagraph {
  // Extract keyString from nested structure
  const keyStringElements = raw.KeyString?.Text;
  const keyStringVersions = extractAllTextVersions(keyStringElements);

  // Transform verses, sorted by sequence
  const verses = (raw.Verse || [])
    .map(transformVerse)
    .sort((a, b) => a.verseSeq - b.verseSeq);

  return {
    chapterName: raw['@_ChapterName'] || '',
    paragraphName: raw['@_ParagraphName'] || '',
    legalReferencePath: raw.LegalReferencePath || '',
    keyString: keyStringVersions.map((t) => ({ text: t.text, language: t.language })),
    agreementType: raw.AgreementType,
    publicationDate: raw.PublicationDate,
    modificationDate: raw.ModificationDate,
    paragraphVersion: raw.ParagraphVersion,
    startDate: raw['@_StartDate'],
    endDate: raw['@_EndDate'],
    verses,
  };
}

/**
 * Gets Chapter IV paragraph details for a CNK code
 *
 * @param cnk - The 7-digit CNK code
 * @param language - Preferred language for text extraction (default: 'en')
 * @returns Chapter IV paragraphs if the medication requires prior authorization
 */
export async function getChapterIVByCnk(
  cnk: string,
  language = 'en'
): Promise<ApiResponse<ChapterIVParagraph[]>> {
  try {
    const soapXml = buildFindChapterIVRequest({
      cnk,
      language,
    });

    const response = await soapRequest('dics', soapXml, {
      cacheType: 'reimbursement', // Same cache policy as reimbursement (reference data)
    });
    const parsed = parseFindChapterIVResponse(response);

    if (!parsed.success || !parsed.data) {
      return {
        success: false,
        error: parsed.error || { code: 'UNKNOWN', message: 'Unknown error' },
      };
    }

    const paragraphs = parsed.data.map(transformParagraph);

    return {
      success: true,
      data: paragraphs,
      meta: {
        searchDate: parsed.searchDate,
        samId: parsed.samId,
        totalResults: paragraphs.length,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'REQUEST_FAILED',
        message: error instanceof Error ? error.message : 'Request failed',
      },
    };
  }
}

/**
 * Gets Chapter IV paragraph details by legal reference path
 *
 * @param legalReferencePath - The legal reference path (e.g., "RD20180201-IV-10680000")
 * @param language - Preferred language for text extraction (default: 'en')
 * @returns Chapter IV paragraph details
 */
export async function getChapterIVByLegalReference(
  legalReferencePath: string,
  language = 'en'
): Promise<ApiResponse<ChapterIVParagraph[]>> {
  try {
    const soapXml = buildFindChapterIVRequest({
      legalReferencePath,
      language,
    });

    const response = await soapRequest('dics', soapXml, {
      cacheType: 'reimbursement',
    });
    const parsed = parseFindChapterIVResponse(response);

    if (!parsed.success || !parsed.data) {
      return {
        success: false,
        error: parsed.error || { code: 'UNKNOWN', message: 'Unknown error' },
      };
    }

    const paragraphs = parsed.data.map(transformParagraph);

    return {
      success: true,
      data: paragraphs,
      meta: {
        searchDate: parsed.searchDate,
        samId: parsed.samId,
        totalResults: paragraphs.length,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'REQUEST_FAILED',
        message: error instanceof Error ? error.message : 'Request failed',
      },
    };
  }
}

/**
 * Extracts the best text for a given language from localized text array
 *
 * @param texts - Array of localized text objects
 * @param preferredLang - Preferred language code
 * @returns The best matching text, or empty string if none found
 */
export function getLocalizedText(
  texts: LocalizedText[] | undefined,
  preferredLang = 'en'
): string {
  if (!texts || texts.length === 0) return '';

  // Try preferred language first
  const preferred = texts.find((t) => t.language === preferredLang);
  if (preferred?.text) return preferred.text;

  // Fall back to English if different from preferred
  if (preferredLang !== 'en') {
    const english = texts.find((t) => t.language === 'en');
    if (english?.text) return english.text;
  }

  // Fall back to first available
  return texts[0]?.text || '';
}

/**
 * Checks if text is available in the selected language
 *
 * @param texts - Array of localized text objects
 * @param language - Language code to check
 * @returns true if text exists in the specified language
 */
export function hasTextInLanguage(
  texts: LocalizedText[] | undefined,
  language: string
): boolean {
  if (!texts || texts.length === 0) return false;
  return texts.some((t) => t.language === language && t.text);
}

/**
 * Builds a flat list of verse texts for display
 * Filters to top-level verses (verseLevel <= 2) for a summary view
 *
 * @param verses - Array of verse objects
 * @param preferredLang - Preferred language code
 * @returns Array of text strings suitable for display
 */
export function getVerseSummary(
  verses: ChapterIVVerse[],
  preferredLang = 'en'
): string[] {
  return verses
    .filter((v) => v.verseLevel <= 2)
    .map((v) => getLocalizedText(v.text, preferredLang))
    .filter((text) => text.length > 0);
}
