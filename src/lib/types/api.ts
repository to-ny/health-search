/**
 * API request/response types
 */

import type { MedicationSearchResult, Medication, Reimbursement, Company, GenericProduct } from './medication';

/**
 * Search parameters for medications
 */
export interface MedicationSearchParams {
  /** Search by name (partial match) */
  query?: string;
  /** Search by CNK code (exact match) */
  cnk?: string;
  /** Search by ingredient name */
  ingredient?: string;
  /** Search by company actor number */
  companyActorNr?: string;
  /** Language for results */
  language?: 'en' | 'nl' | 'fr' | 'de';
  /** Maximum number of results */
  limit?: number;
  /** Offset for pagination */
  offset?: number;
}

/**
 * Search response for medications
 */
export interface MedicationSearchResponse {
  results: MedicationSearchResult[];
  totalCount: number;
  hasMore: boolean;
}

/**
 * Parameters for getting medication detail
 */
export interface MedicationDetailParams {
  /** CNK code or AMP code */
  id: string;
  /** Language for results */
  language?: 'en' | 'nl' | 'fr' | 'de';
  /** Whether to include reimbursement info */
  includeReimbursement?: boolean;
  /** Whether to include equivalents */
  includeEquivalents?: boolean;
}

/**
 * Medication detail response
 */
export interface MedicationDetailResponse {
  medication: Medication;
  reimbursement?: Reimbursement[];
  equivalents?: MedicationSearchResult[];
  genericProduct?: GenericProduct;
}

/**
 * Company search parameters
 */
export interface CompanySearchParams {
  /** Search by name */
  query?: string;
  /** Search by actor number */
  actorNr?: string;
  /** Language */
  language?: 'en' | 'nl' | 'fr' | 'de';
}

/**
 * Company search response
 */
export interface CompanySearchResponse {
  companies: Company[];
  totalCount: number;
}

/**
 * Price comparison item
 */
export interface PriceComparisonItem {
  /** Medication name */
  name: string;
  /** CNK code */
  cnk: string;
  /** Price */
  price?: number;
  /** Patient out-of-pocket cost */
  patientCost?: number;
  /** Insurance reimbursement */
  insuranceAmount?: number;
  /** Whether it's the reference product */
  isReference: boolean;
  /** Whether it's the cheapest option */
  isCheapest: boolean;
  /** Company name */
  companyName?: string;
}

/**
 * Error response
 */
export interface ErrorResponse {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}
