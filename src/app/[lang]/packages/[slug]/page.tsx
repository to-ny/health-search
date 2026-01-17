import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { getAMPPWithRelations } from '@/server/queries/ampp';
import { getLocalizedText } from '@/server/utils/localization';
import { AMPPDetail } from '@/components/detail/ampp-detail';
import { extractIdFromSlug, generateEntitySlug } from '@/lib/utils/slug';
import { generateEntityAlternates } from '@/lib/utils/seo';
import type { Language } from '@/server/types/domain';

interface Props {
  params: Promise<{ lang: string; slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  const ctiExtended = extractIdFromSlug(slug);
  const ampp = await getAMPPWithRelations(ctiExtended);

  if (!ampp) {
    return { title: 'Not Found' };
  }

  const name = ampp.prescriptionName
    ? getLocalizedText(ampp.prescriptionName, lang as Language)
    : getLocalizedText(ampp.amp.name, lang as Language);

  return {
    title: name,
    description: `${name} - Package details including pricing, CNK codes, and reimbursement information.`,
    alternates: generateEntityAlternates('packages', ampp.prescriptionName || ampp.amp.name, ctiExtended),
  };
}

export default async function AMPPPage({ params }: Props) {
  const { lang, slug } = await params;
  const ctiExtended = extractIdFromSlug(slug);
  const ampp = await getAMPPWithRelations(ctiExtended);

  if (!ampp) {
    notFound();
  }

  // Verify slug matches expected format, redirect if needed
  const name = ampp.prescriptionName || ampp.amp.name;
  const expectedSlug = generateEntitySlug(name, ctiExtended, lang as Language);
  if (slug !== expectedSlug) {
    redirect(`/${lang}/packages/${expectedSlug}`);
  }

  return <AMPPDetail ampp={ampp} />;
}
