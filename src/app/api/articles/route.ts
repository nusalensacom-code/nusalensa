import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateReadingTime, slugify } from '@/lib/utils';
import { verifySessionToken } from '@/lib/auth';
import { revalidateHomepageAndNews } from '@/lib/revalidate';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const categoryId = searchParams.get('categoryId');
    const articleType = searchParams.get('articleType');

    const where: any = {};
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { excerpt: { contains: search } },
      ];
    }
    if (status) {
      where.status = status;
    }
    if (categoryId) {
      where.categoryId = parseInt(categoryId, 10);
    }
    if (articleType) {
      where.articleType = articleType;
    }

    const articles = await prisma.article.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
        subcategory: true,
        author: true,
        editor: true,
      },
    });

    return NextResponse.json({ articles });
  } catch (error) {
    console.error('Fetch articles API error:', error);
    return NextResponse.json({ error: 'Failed to load articles.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Check session
    const token = req.cookies.get('nusalensa_session')?.value || req.cookies.get('updateyuk_session')?.value;
    const session = token ? verifySessionToken(token) : null;
    if (!session) {
      return NextResponse.json({ error: 'Access denied. Please log in to continue.' }, { status: 401 });
    }

    const data = await req.json();
    const {
      title,
      slug: customSlug,
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
      articleType = 'NEWS',
      status = 'PUBLISHED',
      isFeatured = false,
      isTrending = false,
      isNews = true,
      seoTitle,
      seoDescription,
      canonicalUrl,
      sources,
      faqs,
      manualRelatedIds,
      tagIds = [],
      publishedAt,
    } = data;

    if (!title || !content || !categoryId || !authorId) {
      return NextResponse.json(
        { error: 'Title, content, primary category, and author are required.' },
        { status: 400 }
      );
    }

    // Generate or format unique slug
    let finalSlug = slugify(customSlug || title);
    const existing = await prisma.article.findUnique({ where: { slug: finalSlug } });
    if (existing) {
      finalSlug = `${finalSlug}-${Date.now().toString().slice(-4)}`;
    }

    const readingTime = calculateReadingTime(content);

    const article = await prisma.article.create({
      data: {
        title,
        slug: finalSlug,
        excerpt: excerpt || title,
        content,
        featuredImage: featuredImage || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80',
        imageAltText: imageAltText || title,
        imageCaption: imageCaption || null,
        imageSource: imageSource || null,
        categoryId: parseInt(categoryId, 10),
        subcategoryId: subcategoryId ? parseInt(subcategoryId, 10) : null,
        authorId: parseInt(authorId, 10),
        editorId: editorId ? parseInt(editorId, 10) : null,
        primaryTopicId: primaryTopicId ? parseInt(primaryTopicId, 10) : null,
        articleType: articleType || 'NEWS',
        status,
        publishedAt: publishedAt ? new Date(publishedAt) : undefined,
        isFeatured: Boolean(isFeatured),
        isTrending: Boolean(isTrending),
        isNews: articleType === 'NEWS' || Boolean(isNews),
        readingTime,
        seoTitle: seoTitle || `${title} | NusaLensa`,
        seoDescription: seoDescription || excerpt,
        canonicalUrl: canonicalUrl || null,
        sources: sources ? (typeof sources === 'string' ? sources : JSON.stringify(sources)) : null,
        faqs: faqs ? (typeof faqs === 'string' ? faqs : JSON.stringify(faqs)) : null,
        manualRelatedIds: manualRelatedIds ? (typeof manualRelatedIds === 'string' ? manualRelatedIds : JSON.stringify(manualRelatedIds)) : null,
        tags: {
          connect: tagIds.map((id: number) => ({ id })),
        },
      },
    });

    if (status === 'PUBLISHED') {
      revalidateHomepageAndNews();
    }

    return NextResponse.json({ success: true, article });
  } catch (error) {
    console.error('Create article API error:', error);
    return NextResponse.json({ error: 'Failed to create new article.' }, { status: 500 });
  }
}
