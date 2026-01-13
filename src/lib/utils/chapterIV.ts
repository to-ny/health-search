/**
 * Chapter IV detection utilities
 *
 * In Belgium, "Chapter IV" medications require prior authorization from the health insurer.
 * The prescriber must submit a request explaining why the patient needs this specific medication.
 *
 * Detection logic:
 * - The LegalReferencePath attribute from FindReimbursement contains the chapter identifier
 * - Format: RD{date}-{chapter}-{paragraph} (e.g., "RD20180201-IV-8870000")
 * - Chapter IV medications have "-IV-" in the path
 */

import type { Reimbursement } from '@/lib/types';

/**
 * Official RIZIV/INAMI information URLs for Chapter IV
 * Updated January 2026 - RIZIV/INAMI website was restructured
 */
export const CHAPTER_IV_INFO_URLS = {
  // Dutch (RIZIV) - explains the a priori control system
  nl: 'https://www.riziv.fgov.be/nl/thema-s/verzorging-kosten-en-terugbetaling/wat-het-ziekenfonds-terugbetaalt/geneesmiddelen/geneesmiddel-terugbetalen/vergoedbare-farmaceutische-specialiteiten/lijst-van-farmaceutische-specialiteiten-de-hoofdstukken/terugbetaling-van-farmaceutische-specialiteiten-uit-hoofdstuk-iv-en-viii-a-priori-controle',
  // French (INAMI) - explains the a priori control system
  fr: 'https://www.inami.fgov.be/fr/themes/soins-de-sante-cout-et-remboursement/les-prestations-de-sante-que-vous-rembourse-votre-mutualite/medicaments/remboursement-d-un-medicament/specialites-pharmaceutiques-remboursables/liste-des-specialites-pharmaceutiques-les-chapitres/remboursement-des-specialites-pharmaceutiques-du-chapitre-iv-et-viii-le-controle-a-priori',
  // German - fallback to French (no German version available)
  de: 'https://www.inami.fgov.be/fr/themes/soins-de-sante-cout-et-remboursement/les-prestations-de-sante-que-vous-rembourse-votre-mutualite/medicaments/remboursement-d-un-medicament/specialites-pharmaceutiques-remboursables/liste-des-specialites-pharmaceutiques-les-chapitres/remboursement-des-specialites-pharmaceutiques-du-chapitre-iv-et-viii-le-controle-a-priori',
  // English - fallback to Dutch (no English version available, Dutch is more comprehensive)
  en: 'https://www.riziv.fgov.be/nl/thema-s/verzorging-kosten-en-terugbetaling/wat-het-ziekenfonds-terugbetaalt/geneesmiddelen/geneesmiddel-terugbetalen/vergoedbare-farmaceutische-specialiteiten/lijst-van-farmaceutische-specialiteiten-de-hoofdstukken/terugbetaling-van-farmaceutische-specialiteiten-uit-hoofdstuk-iv-en-viii-a-priori-controle',
} as const;

/**
 * Checks if a legal reference path indicates Chapter IV
 *
 * @param legalReferencePath - The legal reference path (e.g., "RD20180201-IV-8870000")
 * @returns true if this is a Chapter IV medication
 */
export function isChapterIVPath(legalReferencePath: string | undefined): boolean {
  if (!legalReferencePath) return false;
  return legalReferencePath.includes('-IV-');
}

/**
 * Checks if a reimbursement object indicates a Chapter IV medication
 *
 * @param reimbursement - The reimbursement data
 * @returns true if this medication requires Chapter IV prior authorization
 */
export function isChapterIV(reimbursement: Reimbursement | undefined | null): boolean {
  if (!reimbursement) return false;
  return isChapterIVPath(reimbursement.legalReferencePath);
}

/**
 * Checks if any reimbursement in an array indicates Chapter IV
 *
 * @param reimbursements - Array of reimbursement data
 * @returns true if any reimbursement indicates Chapter IV
 */
export function hasChapterIVReimbursement(
  reimbursements: Reimbursement[] | undefined | null
): boolean {
  if (!reimbursements?.length) return false;
  return reimbursements.some(isChapterIV);
}

/**
 * Gets the Chapter IV info URL for a given language
 *
 * @param language - ISO language code (en, nl, fr, de)
 * @returns URL to official RIZIV/INAMI Chapter IV information page
 */
export function getChapterIVInfoUrl(language: string): string {
  const lang = language.toLowerCase();
  return (
    CHAPTER_IV_INFO_URLS[lang as keyof typeof CHAPTER_IV_INFO_URLS] ||
    CHAPTER_IV_INFO_URLS.en
  );
}
