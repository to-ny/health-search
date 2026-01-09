'use client';

import type { Medication } from '@/lib/types';
import { getPrimaryPrice } from '@/lib/utils/price';

interface MedicationJsonLdProps {
  medication: Medication;
  reimbursed?: boolean;
}

export function MedicationJsonLd({ medication, reimbursed = false }: MedicationJsonLdProps) {
  const price = getPrimaryPrice(medication);
  const primaryCnk = medication.packages[0]?.cnkCodes.find((c) => c.deliveryEnvironment === 'P');

  // Build active ingredients list
  const activeIngredients = medication.components
    .flatMap((comp) => comp.ingredients)
    .filter((ing) => ing.type === 'ACTIVE')
    .map((ing) => ing.substanceName);

  // Build JSON-LD structured data following schema.org/Drug
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Drug',
    name: medication.name,
    ...(medication.officialName && { alternateName: medication.officialName }),
    ...(primaryCnk && {
      code: {
        '@type': 'MedicalCode',
        code: primaryCnk.code,
        codingSystem: 'CNK',
      },
    }),
    ...(activeIngredients.length > 0 && { activeIngredient: activeIngredients.join(', ') }),
    ...(medication.components[0]?.pharmaceuticalForm && {
      dosageForm: medication.components[0].pharmaceuticalForm.name,
    }),
    ...(medication.components[0]?.routeOfAdministration && {
      administrationRoute: medication.components[0].routeOfAdministration.name,
    }),
    ...(medication.companyActorNr && {
      manufacturer: {
        '@type': 'Organization',
        name: medication.companyActorNr,
      },
    }),
    ...(price && {
      offers: {
        '@type': 'Offer',
        price: price.toFixed(2),
        priceCurrency: 'EUR',
        availability: 'https://schema.org/InStock',
      },
    }),
    ...(reimbursed && {
      isAvailableGenerically: true,
    }),
    legalStatus: medication.status === 'AUTHORIZED' ? 'https://schema.org/PrescriptionOnly' : undefined,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
