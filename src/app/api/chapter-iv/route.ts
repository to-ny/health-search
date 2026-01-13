import { NextRequest, NextResponse } from 'next/server';
import { getChapterIVByCnk } from '@/lib/services/chapterIV';
import { createCacheHeaders } from '@/lib/cache';
import type { ChapterIVParagraph, ErrorResponse } from '@/lib/types';

// Chapter IV data: 7 day revalidation (reference data, same as reimbursement)
export const revalidate = 604800;

interface ChapterIVResponse {
  paragraphs: ChapterIVParagraph[];
}

/**
 * GET /api/chapter-iv
 * Get Chapter IV paragraph details for a CNK code
 *
 * Query parameters:
 * - cnk: 7-digit CNK code (required)
 * - lang: Language code (optional, default: 'en')
 */
export async function GET(request: NextRequest): Promise<NextResponse<ChapterIVResponse | ErrorResponse>> {
  const searchParams = request.nextUrl.searchParams;

  const cnk = searchParams.get('cnk');
  const language = (searchParams.get('lang') as 'en' | 'nl' | 'fr' | 'de') || 'en';

  if (!cnk) {
    return NextResponse.json(
      { code: 'MISSING_PARAMS', message: 'CNK parameter is required' },
      { status: 400 }
    );
  }

  // Validate CNK format - accept with or without leading zeros
  const normalizedCnk = cnk.padStart(7, '0');
  if (!/^\d{7}$/.test(normalizedCnk)) {
    return NextResponse.json(
      { code: 'INVALID_CNK', message: 'CNK must be a 7-digit code' },
      { status: 400 }
    );
  }

  try {
    const result = await getChapterIVByCnk(normalizedCnk, language);

    if (!result.success) {
      // Return empty array for "not found" scenarios (medication has no Chapter IV restrictions)
      // This includes SOAP faults and other service errors - we just show no data
      return NextResponse.json(
        { paragraphs: [] },
        { headers: createCacheHeaders('reimbursement') }
      );
    }

    const response: ChapterIVResponse = {
      paragraphs: result.data || [],
    };

    return NextResponse.json(response, {
      headers: createCacheHeaders('reimbursement'),
    });
  } catch (error) {
    console.error('Chapter IV lookup error:', error);
    return NextResponse.json(
      { code: 'INTERNAL_ERROR', message: 'Internal server error' },
      { status: 500 }
    );
  }
}
