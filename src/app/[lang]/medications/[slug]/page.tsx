import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { getAMPWithRelations } from '@/server/queries/amp';
import { getLocalizedText } from '@/server/utils/localization';
import { AMPDetail } from '@/components/detail/amp-detail';
import { extractIdFromSlug, generateEntitySlug } from '@/lib/utils/slug';
import { generateEntityAlternates } from '@/lib/utils/seo';
import { JsonLd } from '@/components/shared/json-ld';
import type { Language } from '@/server/types/domain';

interface Props {
  params: Promise<{ lang: string; slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  const code = extractIdFromSlug(slug);
  const amp = await getAMPWithRelations(code);

  if (!amp) {
    return { title: 'Not Found' };
  }

  const name = getLocalizedText(amp.name, lang as Language);
  const company = amp.company?.denomination;

  return {
    title: name,
    description: `${name}${company ? ` by ${company}` : ''} - Brand medication with ${amp.packages.length} package${amp.packages.length !== 1 ? 's' : ''} available.`,
    alternates: generateEntityAlternates('medications', amp.name, code),
  };
}

export default async function AMPPage({ params }: Props) {
  const { lang, slug } = await params;
  const code = extractIdFromSlug(slug);
  const amp = await getAMPWithRelations(code);

  if (!amp) {
    notFound();
  }

  // Verify slug matches expected format, redirect if needed
  const expectedSlug = generateEntitySlug(amp.name, code, lang as Language);
  if (slug !== expectedSlug) {
    redirect(`/${lang}/medications/${expectedSlug}`);
  }

  const name = getLocalizedText(amp.name, lang as Language);

  // Structured data for medication
  const drugSchema = {
    '@context': 'https://schema.org',
    '@type': 'Drug',
    name: name,
    identifier: code,
    ...(amp.company && {
      manufacturer: {
        '@type': 'Organization',
        name: amp.company.denomination,
      },
    }),
    // Active ingredients are available in amp.ingredients, not via vmp.vtm
    ...(amp.ingredients.length > 0 && amp.ingredients[0].substanceName && {
      activeIngredient: getLocalizedText(amp.ingredients[0].substanceName, lang as Language),
    }),
  };

  return (
    <>
      <JsonLd data={drugSchema} />
      <AMPDetail amp={amp} />
    </>
  );
}
