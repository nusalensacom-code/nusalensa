import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * Ultra-lightweight endpoint returning the latest published article ID & timestamp.
 * Used by the LiveArticleWatcher client component to detect fresh articles on the homepage.
 */
export async function GET() {
  try {
    const latest = await prisma.article.findFirst({
      where: { status: 'PUBLISHED' },
      orderBy: { publishedAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        publishedAt: true,
        category: {
          select: { slug: true },
        },
      },
    });

    return NextResponse.json({
      latestArticle: latest,
      articleId: latest?.id || 0,
      timestamp: latest?.publishedAt ? new Date(latest.publishedAt).getTime() : 0,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

