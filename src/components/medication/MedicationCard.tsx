'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Acronym } from '@/components/ui/Tooltip';
import { formatPrice } from '@/lib/utils/price';
import { parsePackSize } from '@/lib/utils/format';
import { useTranslatedEnum } from '@/hooks';
import type { Medication } from '@/lib/types';

interface MedicationCardProps {
  medication: Medication;
  onCompare?: () => void;
  showActions?: boolean;
}

export function MedicationCard({ medication, onCompare, showActions = true }: MedicationCardProps) {
  const t = useTranslations();
  const translateEnum = useTranslatedEnum();
  // Get primary CNK and price
  const primaryPackage = medication.packages[0];
  const primaryCnk = primaryPackage?.cnkCodes.find((c) => c.deliveryEnvironment === 'P');
  const price = primaryCnk?.price;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{medication.name}</CardTitle>
            {medication.officialName && medication.officialName !== medication.name && (
              <CardDescription>{medication.officialName}</CardDescription>
            )}
          </div>
          {medication.blackTriangle && (
            <span
              className="text-2xl text-yellow-500"
              title={t('medication.blackTriangle')}
              aria-label={t('medication.blackTriangleLabel')}
            >
              ▼
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {/* Consistent list format */}
        <dl className="space-y-3">
          {/* Status */}
          <div className="flex items-center justify-between">
            <dt className="text-sm text-gray-500 dark:text-gray-400">{t('medication.status')}</dt>
            <dd className="font-medium text-gray-900 dark:text-white">
              {translateEnum('status', medication.status)}
            </dd>
          </div>

          {/* CNK */}
          {primaryCnk && (
            <div className="flex items-center justify-between">
              <dt className="text-sm text-gray-500 dark:text-gray-400">
                <Acronym term="CNK">CNK</Acronym>
              </dt>
              <dd className="font-medium text-gray-900 dark:text-white">{primaryCnk.code}</dd>
            </div>
          )}

          {/* AMP Code */}
          <div className="flex items-center justify-between">
            <dt className="text-sm text-gray-500 dark:text-gray-400">
              <Acronym term="AMP">AMP</Acronym> {t('medication.code')}
            </dt>
            <dd className="font-medium text-gray-900 dark:text-white">{medication.ampCode}</dd>
          </div>

          {/* Company */}
          {medication.companyActorNr && (
            <div className="flex items-center justify-between">
              <dt className="text-sm text-gray-500 dark:text-gray-400">{t('medication.company')}</dt>
              <dd>
                <Link
                  href={`/companies/${medication.companyActorNr}`}
                  className="font-medium text-blue-600 hover:underline dark:text-blue-400"
                >
                  {medication.companyName || t('medication.companyNumber', { number: medication.companyActorNr })}
                </Link>
              </dd>
            </div>
          )}

          {/* Pack Size */}
          {primaryPackage && (primaryPackage.packDisplayValue || primaryPackage.name) && (() => {
            const pharmaceuticalForm = medication.components[0]?.pharmaceuticalForm?.name;
            const packInfo = parsePackSize(primaryPackage.packDisplayValue || primaryPackage.name, pharmaceuticalForm);

            return (
              <div className="flex items-center justify-between">
                <dt className="text-sm text-gray-500 dark:text-gray-400">{t('medication.package')}</dt>
                <dd className="font-medium text-gray-900 dark:text-white">
                  {packInfo.displayRaw
                    ? packInfo.rawValue
                    : t(`medication.packSizeUnits.${packInfo.unitKey}`, { count: packInfo.count ?? 0 })}
                </dd>
              </div>
            );
          })()}

          {/* Medicine Type */}
          {medication.medicineType && (
            <div className="flex items-center justify-between">
              <dt className="text-sm text-gray-500 dark:text-gray-400">{t('medication.type')}</dt>
              <dd className="font-medium text-gray-900 dark:text-white">
                {translateEnum('medicineType', medication.medicineType)}
              </dd>
            </div>
          )}

          {/* Reimbursement badges */}
          {(primaryCnk?.reimbursable || primaryCnk?.cheapest) && (
            <div className="flex items-center justify-between">
              <dt className="text-sm text-gray-500 dark:text-gray-400">{t('medication.labels')}</dt>
              <dd className="flex gap-2">
                {primaryCnk?.reimbursable && <Badge variant="info">{t('badge.reimbursed')}</Badge>}
                {primaryCnk?.cheapest && <Badge variant="success">{t('badge.cheapest')}</Badge>}
              </dd>
            </div>
          )}

          {/* Price - emphasized */}
          <div className="flex items-center justify-between border-t border-gray-200 pt-3 dark:border-gray-700">
            <dt className="text-sm text-gray-500 dark:text-gray-400">{t('medication.price')}</dt>
            <dd className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatPrice(price)}
            </dd>
          </div>
        </dl>
      </CardContent>

      {showActions && (
        <CardFooter className="justify-end gap-2">
          {medication.vmpCode && (
            <Button variant="outline" size="sm" onClick={onCompare}>
              {t('medication.compareEquivalents')}
            </Button>
          )}
          <Link href={`/medication/${primaryCnk?.code || medication.ampCode}`}>
            <Button size="sm">{t('medication.viewDetails')}</Button>
          </Link>
        </CardFooter>
      )}
    </Card>
  );
}
