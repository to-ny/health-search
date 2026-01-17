import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { getATCWithRelations, getATCHierarchy } from '@/server/queries/atc';
import { ATCDetail } from '@/components/detail/atc-detail';
import { extractATCCodeFromSlug, generateATCSlug } from '@/lib/utils/slug';
import { generateATCAlternates } from '@/lib/utils/seo';
import type { Language, MultilingualText } from '@/server/types/domain';

interface Props {
  params: Promise<{ lang: string; slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  const code = extractATCCodeFromSlug(slug);
  const atc = await getATCWithRelations(code);

  if (!atc) {
    return { title: 'Not Found' };
  }

  // Create MultilingualText from description for alternates
  const description: MultilingualText = { [lang as Language]: atc.description };

  return {
    title: `${atc.code} - ${atc.description}`,
    description: `${atc.code} ${atc.description} - ATC classification with ${atc.packageCount} products.`,
    alternates: generateATCAlternates(code, description),
  };
}

export default async function ATCPage({ params, searchParams }: Props) {
  const { lang, slug } = await params;
  const { page } = await searchParams;
  const code = extractATCCodeFromSlug(slug);
  const currentPage = page ? Math.max(1, parseInt(page, 10) || 1) : 1;
  const limit = 50;
  const offset = (currentPage - 1) * limit;

  const [atc, hierarchy] = await Promise.all([
    getATCWithRelations(code, limit, offset),
    getATCHierarchy(code),
  ]);

  if (!atc) {
    notFound();
  }

  // Verify slug matches expected format, redirect if needed
  // For ATC, we create a MultilingualText from the description
  const description: MultilingualText = { [lang as Language]: atc.description };
  const expectedSlug = generateATCSlug(code, description, lang as Language);
  if (slug !== expectedSlug) {
    redirect(`/${lang}/classifications/${expectedSlug}`);
  }

  return <ATCDetail atc={atc} hierarchy={hierarchy} currentPage={currentPage} pageSize={limit} />;
}
