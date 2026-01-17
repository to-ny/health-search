import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { getVMPWithRelations } from '@/server/queries/vmp';
import { getLocalizedText } from '@/server/utils/localization';
import { VMPDetail } from '@/components/detail/vmp-detail';
import { extractIdFromSlug, generateEntitySlug } from '@/lib/utils/slug';
import { generateEntityAlternates } from '@/lib/utils/seo';
import type { Language } from '@/server/types/domain';

interface Props {
  params: Promise<{ lang: string; slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  const code = extractIdFromSlug(slug);
  const vmp = await getVMPWithRelations(code);

  if (!vmp) {
    return { title: 'Not Found' };
  }

  const name = getLocalizedText(vmp.name, lang as Language);

  return {
    title: name,
    description: `${name} - Generic product with ${vmp.amps.length} brand products available.`,
    alternates: generateEntityAlternates('generics', vmp.name, code),
  };
}

export default async function VMPPage({ params }: Props) {
  const { lang, slug } = await params;
  const code = extractIdFromSlug(slug);
  const vmp = await getVMPWithRelations(code);

  if (!vmp) {
    notFound();
  }

  // Verify slug matches expected format, redirect if needed
  const expectedSlug = generateEntitySlug(vmp.name, code, lang as Language);
  if (slug !== expectedSlug) {
    redirect(`/${lang}/generics/${expectedSlug}`);
  }

  return <VMPDetail vmp={vmp} />;
}
