'use client';

import { useQuery } from '@tanstack/react-query';
import { getClientStaleTime } from '@/lib/cache';
import type { ChapterIVParagraph, ErrorResponse } from '@/lib/types';

interface ChapterIVResponse {
  paragraphs: ChapterIVParagraph[];
}

interface ChapterIVOptions {
  cnk?: string;
  language?: string;
  /** Only fetch when explicitly enabled (for progressive disclosure) */
  enabled?: boolean;
}

async function fetchChapterIV(options: ChapterIVOptions): Promise<ChapterIVResponse> {
  const searchParams = new URLSearchParams();

  if (options.cnk) searchParams.set('cnk', options.cnk);
  if (options.language) searchParams.set('lang', options.language);

  const response = await fetch(`/api/chapter-iv?${searchParams.toString()}`);

  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    throw new Error(error.message || 'Failed to fetch Chapter IV details');
  }

  return response.json();
}

/**
 * Hook for fetching Chapter IV paragraph details on demand
 *
 * @param options.cnk - CNK code to look up
 * @param options.language - Preferred language for text
 * @param options.enabled - Set to true to trigger the fetch (for progressive disclosure)
 */
export function useChapterIV(options: ChapterIVOptions) {
  const hasCnk = Boolean(options.cnk);
  const isEnabled = options.enabled ?? false;

  return useQuery({
    queryKey: ['chapter-iv', options.cnk, options.language],
    queryFn: () => fetchChapterIV(options),
    enabled: hasCnk && isEnabled,
    staleTime: getClientStaleTime('reimbursement'),
  });
}
