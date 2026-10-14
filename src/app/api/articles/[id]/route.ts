import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateReadingTime, slugify } from '@/lib/utils';
import { verifySessionToken } from '@/lib/auth';
import { revalidateHomepageAndNews } from '@/lib/revalidate';

interface RouteContext {
  params: { id: string };
}

export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const id = parseInt(params.id, 10);
    const article = await prisma.article.findUnique({
      where: { id },
      include: {
        category: true,
        subcategory: true,
        author: true,
        editor: true,
        primaryTopic: true,
        tags: true,
      },
    });

    if (!article) {
      return NextResponse.json({ error: 'Article not found.' }, { status: 404 });
    }

    return NextResponse.json({ article });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    const token = req.cookies.get('nusalensa_session')?.value || req.cookies.get('updateyuk_session')?.value;
    const session = token ? verifySessionToken(token) : null;
    if (!session) {
      return NextResponse.json({ error: 'Access denied. Please log in to continue.' }, { status: 401 });
    }

    const id = parseInt(params.id, 10);
    const data = await req.json();

    const {
      title,
      slug,
      excerpt,
      content,
      featuredImage,
      imageAltText,
      imageCaption,
      imageSource,
      categoryId,
      subcategoryId,
      authorId,
      editorId,
      primaryTopicId,
      articleType,
      status,
      isFeatured,
      isTrending,
      isNews,
      seoTitle,
      seoDescription,
      canonicalUrl,
      sources,
      faqs,
      manualRelatedIds,
      tagIds,
      publishedAt,
    } = data;

    const readingTime = content ? calculateReadingTime(content) : undefined;

    const updated = await prisma.article.update({
      where: { id },
      data: {
        title,
        slug: slug ? slugify(slug) : undefined,
        excerpt,
        content,
        featuredImage,
        imageAltText,
        imageCaption,
        imageSource,
        categoryId: categoryId ? parseInt(categoryId, 10) : undefined,
        subcategoryId: subcategoryId !== undefined ? (subcategoryId ? parseInt(subcategoryId, 10) : null) : undefined,
        authorId: authorId ? parseInt(authorId, 10) : undefined,
        editorId: editorId !== undefined ? (editorId ? parseInt(editorId, 10) : null) : undefined,
        primaryTopicId: primaryTopicId !== undefined ? (primaryTopicId ? parseInt(primaryTopicId, 10) : null) : undefined,
        articleType,
        status,
        publishedAt: publishedAt ? new Date(publishedAt) : undefined,
        isFeatured: isFeatured !== undefined ? Boolean(isFeatured) : undefined,
        isTrending: isTrending !== undefined ? Boolean(isTrending) : undefined,
        isNews: isNews !== undefined ? Boolean(isNews) : undefined,
        readingTime,
        seoTitle,
        seoDescription,
        canonicalUrl,
        sources: sources !== undefined ? (typeof sources === 'string' ? sources : JSON.stringify(sources)) : undefined,
        faqs: faqs !== undefined ? (typeof faqs === 'string' ? faqs : JSON.stringify(faqs)) : undefined,
        manualRelatedIds: manualRelatedIds !== undefined ? (typeof manualRelatedIds === 'string' ? manualRelatedIds : JSON.stringify(manualRelatedIds)) : undefined,
        tags: tagIds
          ? {
              set: tagIds.map((tid: number) => ({ id: tid })),
            }
          : undefined,
      },
    });

    revalidateHomepageAndNews();

    return NextResponse.json({ success: true, article: updated });
  } catch (error) {
    console.error('Update article error:', error);
    return NextResponse.json({ error: 'Failed to update article.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    const token = req.cookies.get('nusalensa_session')?.value || req.cookies.get('updateyuk_session')?.value;
    const session = token ? verifySessionToken(token) : null;
    if (!session) {
      return NextResponse.json({ error: 'Access denied. Please log in to continue.' }, { status: 401 });
    }

    const id = parseInt(params.id, 10);
    await prisma.article.delete({
      where: { id },
    });

    revalidateHomepageAndNews();

    return NextResponse.json({ success: true, message: 'Article deleted successfully.' });
  } catch (error) {
    console.error('Delete article error:', error);
    return NextResponse.json({ error: 'Failed to delete article.' }, { status: 500 });
  }
}
