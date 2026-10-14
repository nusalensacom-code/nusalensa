import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminAuth } from '@/lib/adminAuth';

interface RouteContext {
  params: { id: string };
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    const auth = requireAdminAuth(req, ['SUPER_ADMIN', 'ADMIN', 'EDITOR']);
    if (auth instanceof NextResponse) return auth;

    const id = parseInt(params.id, 10);
    const original = await prisma.article.findUnique({
      where: { id },
      include: { tags: true },
    });

    if (!original) {
      return NextResponse.json({ error: 'Original article not found.' }, { status: 404 });
    }

    const uniqueSuffix = Date.now().toString().slice(-4);
    const newSlug = `${original.slug}-copy-${uniqueSuffix}`;

    const duplicated = await prisma.article.create({
      data: {
        title: `[Copy] ${original.title}`,
        slug: newSlug,
        excerpt: original.excerpt,
        content: original.content,
        featuredImage: original.featuredImage,
        imageAltText: original.imageAltText,
        imageCaption: original.imageCaption,
        imageSource: original.imageSource,
        categoryId: original.categoryId,
        subcategoryId: original.subcategoryId,
        authorId: original.authorId,
        editorId: original.editorId,
        primaryTopicId: original.primaryTopicId,
        articleType: original.articleType,
        status: 'DRAFT', // Duplicates start as Draft
        isFeatured: false,
        isTrending: false,
        isNews: original.isNews,
        readingTime: original.readingTime,
        seoTitle: original.seoTitle ? `[Copy] ${original.seoTitle}` : null,
        seoDescription: original.seoDescription,
        canonicalUrl: null,
        sources: original.sources,
        faqs: original.faqs,
        manualRelatedIds: original.manualRelatedIds,
        tags: {
          connect: original.tags.map((t) => ({ id: t.id })),
        },
      },
    });

    return NextResponse.json({ success: true, article: duplicated });
  } catch (error) {
    console.error('Duplicate article error:', error);
    return NextResponse.json({ error: 'Failed to duplicate article.' }, { status: 500 });
  }
}

