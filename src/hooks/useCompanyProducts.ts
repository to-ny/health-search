'use client';

import { useQuery } from '@tanstack/react-query';
import { getClientStaleTime } from '@/lib/cache';
import type { MedicationSearchResponse, ErrorResponse } from '@/lib/types';

interface UseCompanyProductsParams {
  actorNr: string;
  language?: string;
  limit?: number;
  offset?: number;
}

async function fetchCompanyProducts(
  params: UseCompanyProductsParams,
  signal?: AbortSignal
): Promise<MedicationSearchResponse> {
  const searchParams = new URLSearchParams();

  if (params.language) searchParams.set('lang', params.language);
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.offset) searchParams.set('offset', String(params.offset));

  const response = await fetch(`/api/companies/${params.actorNr}/products?${searchParams.toString()}`, {
    signal,
  });

  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    throw new Error(error.message || 'Failed to fetch company products');
  }

  return response.json();
}

export function getCompanyProductsQueryKey(params: UseCompanyProductsParams) {
  return ['company', params.actorNr, 'products', params.language, params.limit, params.offset] as const;
}

export function useCompanyProducts(params: UseCompanyProductsParams, enabled = true) {
  return useQuery({
    queryKey: getCompanyProductsQueryKey(params),
    queryFn: ({ signal }) => fetchCompanyProducts(params, signal),
    enabled: enabled && Boolean(params.actorNr),
    staleTime: getClientStaleTime('companyProducts'),
  });
}
