import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getChapterIVParagraphWithRelations } from '@/server/queries/chapter-iv';
import { getLocalizedText } from '@/server/utils/localization';
import { ChapterIVDetail } from '@/components/detail/chapter-iv-detail';
import { generateChapterIVAlternates } from '@/lib/utils/seo';
import type { Language } from '@/server/types/domain';

interface Props {
  params: Promise<{ lang: string; chapter: string; paragraph: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, chapter, paragraph } = await params;
  const chapterIV = await getChapterIVParagraphWithRelations(chapter, paragraph);

  if (!chapterIV) {
    return { title: 'Not Found' };
  }

  const keyString = chapterIV.keyString ? getLocalizedText(chapterIV.keyString, lang as Language) : '';

  return {
    title: `Chapter ${chapter} - ${paragraph}`,
    description: `Chapter IV paragraph ${paragraph}${keyString ? `: ${keyString}` : ''} - Prior authorization requirements.`,
    alternates: generateChapterIVAlternates(chapter, paragraph),
  };
}

export default async function ChapterIVPage({ params }: Props) {
  const { chapter, paragraph } = await params;
  const chapterIV = await getChapterIVParagraphWithRelations(chapter, paragraph);

  if (!chapterIV) {
    notFound();
  }

  return <ChapterIVDetail chapterIV={chapterIV} />;
}
