import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { getVMPGroupWithRelations } from '@/server/queries/vmp-group';
import { getLocalizedText } from '@/server/utils/localization';
import { VMPGroupDetail } from '@/components/detail/vmp-group-detail';
import { extractIdFromSlug, generateEntitySlug } from '@/lib/utils/slug';
import { generateEntityAlternates } from '@/lib/utils/seo';
import type { Language } from '@/server/types/domain';

interface Props {
  params: Promise<{ lang: string; slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  const code = extractIdFromSlug(slug);
  const vmpGroup = await getVMPGroupWithRelations(code);

  if (!vmpGroup) {
    return { title: 'Not Found' };
  }

  const name = getLocalizedText(vmpGroup.name, lang as Language);

  return {
    title: name,
    description: `${name} - Therapeutic group with ${vmpGroup.vmps.length} generic products and ${vmpGroup.dosages.length} dosage recommendations.`,
    alternates: generateEntityAlternates('therapeutic-groups', vmpGroup.name, code),
  };
}

export default async function VMPGroupPage({ params }: Props) {
  const { lang, slug } = await params;
  const code = extractIdFromSlug(slug);
  const vmpGroup = await getVMPGroupWithRelations(code);

  if (!vmpGroup) {
    notFound();
  }

  // Verify slug matches expected format, redirect if needed
  const expectedSlug = generateEntitySlug(vmpGroup.name, code, lang as Language);
  if (slug !== expectedSlug) {
    redirect(`/${lang}/therapeutic-groups/${expectedSlug}`);
  }

  return <VMPGroupDetail vmpGroup={vmpGroup} />;
}
