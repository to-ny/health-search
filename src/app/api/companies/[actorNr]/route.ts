import { NextRequest, NextResponse } from 'next/server';
import { getCompanyByActorNr } from '@/lib/services/company';
import type { Company, ErrorResponse } from '@/lib/types';

export const revalidate = 86400; // 24 hour cache

/**
 * GET /api/companies/[actorNr]
 * Get a specific company by actor number
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ actorNr: string }> }
): Promise<NextResponse<Company | ErrorResponse>> {
  const { actorNr } = await params;
  const searchParams = request.nextUrl.searchParams;
  const language = (searchParams.get('lang') as 'en' | 'nl' | 'fr' | 'de') || 'en';

  // Validate actor number format (1-5 digits, will be zero-padded to 5)
  if (!/^\d{1,5}$/.test(actorNr)) {
    return NextResponse.json(
      { code: 'INVALID_ACTOR_NR', message: 'Actor number must be a numeric code (1-5 digits)' },
      { status: 400 }
    );
  }

  try {
    const result = await getCompanyByActorNr(actorNr, language);

    if (!result.success || !result.data) {
      return NextResponse.json(
        { code: result.error?.code || 'NOT_FOUND', message: result.error?.message || 'Company not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.data, {
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
      },
    });
  } catch (error) {
    console.error('Company lookup error:', error);
    return NextResponse.json(
      { code: 'INTERNAL_ERROR', message: 'Internal server error' },
      { status: 500 }
    );
  }
}
