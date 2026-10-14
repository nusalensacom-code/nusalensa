import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

interface TagPageProps {
  params: { slug: string };
}

export async function generateStaticParams() {
  try {
    const tags = await prisma.tag.findMany({ select: { slug: true } });
    return tags.map((t) => ({ slug: t.slug }));
  } catch (e) {
    return [];
  }
}

// Ensure single canonical URL structure: all /tag/[slug] requests are 308 redirected to /topic/[slug]
export default function TagRedirectPage({ params }: TagPageProps) {
  redirect(`/topic/${params.slug}`);
}
