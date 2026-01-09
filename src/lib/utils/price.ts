/**
 * Price utilities for medication pricing and comparison
 */

import type { Medication, MedicationSearchResult, Reimbursement, PriceComparisonItem } from '@/lib/types';
import { calculatePatientCost } from '@/lib/services/reimbursement';

/**
 * Formats a price in euros
 */
export function formatPrice(price: number | undefined, locale = 'nl-BE'): string {
  if (price === undefined) return 'N/A';

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'EUR',
  }).format(price);
}

/**
 * Calculates savings between two prices
 */
export function calculateSavings(originalPrice: number, newPrice: number): {
  amount: number;
  percentage: number;
} {
  const amount = originalPrice - newPrice;
  const percentage = originalPrice > 0 ? (amount / originalPrice) * 100 : 0;

  return { amount, percentage };
}

/**
 * Finds the cheapest option in a list of medications
 */
export function findCheapest(medications: MedicationSearchResult[]): MedicationSearchResult | undefined {
  return medications.reduce<MedicationSearchResult | undefined>((cheapest, current) => {
    if (current.price === undefined) return cheapest;
    if (!cheapest || cheapest.price === undefined) return current;
    return current.price < cheapest.price ? current : cheapest;
  }, undefined);
}

/**
 * Creates price comparison items from medications and their reimbursement data
 */
export function createPriceComparison(
  medications: MedicationSearchResult[],
  reimbursements: Map<string, Reimbursement | undefined>,
  referenceAmpCode?: string
): PriceComparisonItem[] {
  const items = medications.map((med) => {
    const reimbursement = med.cnk ? reimbursements.get(med.cnk) : undefined;
    const patientCost = med.price !== undefined
      ? calculatePatientCost(med.price, reimbursement)
      : undefined;

    return {
      name: med.name,
      cnk: med.cnk || '',
      price: med.price,
      patientCost,
      insuranceAmount: med.price !== undefined && patientCost !== undefined
        ? med.price - patientCost
        : undefined,
      isReference: med.ampCode === referenceAmpCode,
      isCheapest: false,
      companyName: med.companyName,
    };
  });

  // Mark cheapest
  const cheapestPrice = Math.min(
    ...items.filter((i) => i.patientCost !== undefined).map((i) => i.patientCost!)
  );

  for (const item of items) {
    if (item.patientCost === cheapestPrice) {
      item.isCheapest = true;
    }
  }

  return items.sort((a, b) => (a.patientCost || Infinity) - (b.patientCost || Infinity));
}

/**
 * Gets price category based on patient cost
 */
export type PriceCategory = 'cheap' | 'moderate' | 'expensive';

export function getPriceCategory(patientCost: number | undefined): PriceCategory {
  if (patientCost === undefined) return 'moderate';
  if (patientCost <= 5) return 'cheap';
  if (patientCost <= 15) return 'moderate';
  return 'expensive';
}

/**
 * Gets all CNK codes with their prices from a medication
 */
export function getCnkPrices(medication: Medication): Array<{ cnk: string; price?: number; deliveryEnv: 'P' | 'H' }> {
  return medication.packages.flatMap((pkg) =>
    pkg.cnkCodes.map((cnk) => ({
      cnk: cnk.code,
      price: cnk.price,
      deliveryEnv: cnk.deliveryEnvironment,
    }))
  );
}

/**
 * Gets the primary (public pharmacy) price for a medication
 */
export function getPrimaryPrice(medication: Medication): number | undefined {
  for (const pkg of medication.packages) {
    const publicCnk = pkg.cnkCodes.find((c) => c.deliveryEnvironment === 'P');
    if (publicCnk?.price !== undefined) {
      return publicCnk.price;
    }
  }
  return undefined;
}
