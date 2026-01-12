'use client';

import { useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useLanguage } from '@/components/LanguageSwitcher';
import { useMedicationDetail, useMedicationSearch, useTranslatedEnum } from '@/hooks';
import { SearchBar, type SearchType } from '@/components/search';
import { PriceComparison } from '@/components/medication/PriceComparison';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { Acronym } from '@/components/ui/Tooltip';
import { LocalizedName } from '@/components/ui/LocalizedName';
import { getPrimaryPrice, formatPrice } from '@/lib/utils/price';
import type { MedicationSearchParams, MedicationSearchResult } from '@/lib/types';

function CompareContent() {
  const t = useTranslations();
  const translateEnum = useTranslatedEnum();
  const searchParams = useSearchParams();
  const baseId = searchParams.get('base');
  const [language] = useLanguage();

  // State for the selected medication to compare
  const [selectedId, setSelectedId] = useState<string | undefined>(baseId || undefined);

  // State for search (name/ingredient searches need to show results first)
  const [searchState, setSearchState] = useState<MedicationSearchParams>({});
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Fetch search results (for name/ingredient searches)
  const {
    data: searchData,
    isLoading: isSearching,
    error: searchError,
  } = useMedicationSearch(searchState, showSearchResults);

  // Fetch medication detail once selected
  const { data, isLoading, error } = useMedicationDetail(selectedId, {
    language,
    includeEquivalents: true,
    includeReimbursement: true,
  });

  const handleSearch = useCallback((query: string, type: SearchType) => {
    // For CNK searches, use directly
    if (type === 'cnk' && /^\d{7}$/.test(query)) {
      setSelectedId(query);
      setShowSearchResults(false);
      setSearchState({});
      return;
    }

    // For name/ingredient searches, show search results first
    const params: MedicationSearchParams = { language, limit: 10 };
    if (type === 'name') {
      params.query = query;
    } else if (type === 'ingredient') {
      params.ingredient = query;
    }

    setSearchState(params);
    setShowSearchResults(true);
    setSelectedId(undefined); // Clear previous selection
  }, [language]);

  const handleSelectMedication = useCallback((medication: MedicationSearchResult) => {
    // Use CNK if available, otherwise AMP code
    const id = medication.cnk || medication.ampCode;
    setSelectedId(id);
    setShowSearchResults(false);
    setSearchState({});
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedId(undefined);
    setShowSearchResults(false);
    setSearchState({});
  }, []);

  return (
    <>
      {/* Search for base medication */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>{t('compare.selectMedication')}</CardTitle>
        </CardHeader>
        <CardContent>
          <SearchBar
            onSearch={handleSearch}
            loading={isSearching}
            initialType="name"
          />
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {t('compare.searchHint')}
          </p>
        </CardContent>
      </Card>

      {/* Search results for name/ingredient searches */}
      {showSearchResults && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{t('compare.selectFromResults')}</CardTitle>
          </CardHeader>
          <CardContent>
            {isSearching && (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16" />
                ))}
              </div>
            )}

            {searchError && (
              <p className="text-red-600 dark:text-red-400">{searchError.message}</p>
            )}

            {!isSearching && !searchError && !searchData?.results?.length && (
              <p className="py-8 text-center text-gray-500 dark:text-gray-400">
                {t('compare.noResults')}
              </p>
            )}

            {!isSearching && searchData?.results && searchData.results.length > 0 && (
              <div className="space-y-2" role="listbox" aria-label="Search results">
                {searchData.results.map((med) => (
                  <button
                    key={med.ampCode}
                    onClick={() => handleSelectMedication(med)}
                    className="w-full cursor-pointer rounded-lg border border-gray-200 p-4 text-left transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                    role="option"
                    aria-selected="false"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{med.name}</p>
                        <div className="mt-1 flex flex-wrap gap-2">
                          {med.cnk && (
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              <Acronym term="CNK">CNK</Acronym>: {med.cnk}
                            </span>
                          )}
                          {med.companyName && (
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {med.companyName}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {med.isReimbursed && (
                          <Badge variant="info" size="sm">{t('badge.reimbursed')}</Badge>
                        )}
                        {med.price && (
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {formatPrice(med.price)}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
                {searchData.totalCount > searchData.results.length && (
                  <p className="pt-2 text-center text-sm text-gray-500 dark:text-gray-400">
                    {t('search.resultCount', { count: searchData.totalCount })}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Loading state for detail */}
      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-64" />
        </div>
      )}

      {/* Error state */}
      {error && (
        <Card variant="outline" className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
          <CardContent className="py-8 text-center">
            <p className="text-red-600 dark:text-red-400">{error.message}</p>
          </CardContent>
        </Card>
      )}

      {/* Comparison results */}
      {data && (
        <div className="space-y-6">
          {/* Selected medication info */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{t('compare.selectedMedication')}</CardTitle>
                <button
                  onClick={handleClearSelection}
                  className="text-sm text-blue-600 hover:underline dark:text-blue-400"
                >
                  {t('compare.changeSelection')}
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {data.medication.name}
              </h3>
              {data.medication.officialName && (
                <p className="text-gray-500 dark:text-gray-400">{data.medication.officialName}</p>
              )}
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('common.price')}</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formatPrice(getPrimaryPrice(data.medication))}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('common.status')}</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {translateEnum('status', data.medication.status)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400"><Acronym term="VMP">VMP</Acronym> {t('medication.code')}</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {data.medication.vmpCode || t('compare.vmpCodeNA')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Price comparison */}
          {data.equivalents && data.equivalents.length > 0 ? (
            <PriceComparison
              currentMedication={{
                ampCode: data.medication.ampCode,
                name: data.medication.name,
                companyName: data.medication.companyName,
                cnk: data.medication.packages[0]?.cnkCodes.find((c) => c.deliveryEnvironment === 'P')
                  ?.code,
                price: getPrimaryPrice(data.medication),
                isReimbursed: Boolean(data.reimbursement?.length),
                status: data.medication.status,
              }}
              equivalents={data.equivalents}
              title={t('compare.allEquivalents')}
              showCompareLink={false}
            />
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-gray-500 dark:text-gray-400">
                  {t('compare.noEquivalents')}
                </p>
                {!data.medication.vmpCode && (
                  <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">
                    {t('compare.noVmpLink')}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Generic product info */}
          {data.genericProduct && (
            <Card>
              <CardHeader>
                <CardTitle>{t('compare.genericProductInfo')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('compare.genericName')}</p>
                    <LocalizedName
                      name={data.genericProduct.name}
                      nameLanguage={data.genericProduct.nameLanguage}
                      allNames={data.genericProduct.allNames}
                      size="md"
                      className="font-medium"
                    />
                  </div>
                  {data.genericProduct.vmpGroup && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t('medication.therapeuticGroup')}</p>
                      <LocalizedName
                        name={data.genericProduct.vmpGroup.name}
                        nameLanguage={data.genericProduct.vmpGroup.nameLanguage}
                        allNames={data.genericProduct.vmpGroup.allNames}
                        size="md"
                        className="font-medium"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Empty state */}
      {!selectedId && !showSearchResults && !isLoading && (
        <Card variant="outline">
          <CardContent className="py-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <p className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
              {t('compare.emptyStateTitle')}
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {t('compare.emptyStateDesc')}
            </p>
          </CardContent>
        </Card>
      )}
    </>
  );
}

export default function ComparePage() {
  const t = useTranslations();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold text-gray-900 dark:text-white">
        {t('compare.title')}
      </h1>

      <Suspense fallback={<Skeleton className="h-64" />}>
        <CompareContent />
      </Suspense>
    </div>
  );
}
