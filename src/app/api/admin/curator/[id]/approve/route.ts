import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminAuth } from '@/lib/adminAuth';
import { slugify } from '@/lib/utils';
import { revalidateHomepageAndNews } from '@/lib/revalidate';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = requireAdminAuth(req, ['SUPER_ADMIN', 'ADMIN', 'EDITOR']);
    if (auth instanceof NextResponse) return auth;

    const id = parseInt(params.id, 10);
    if (isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

    const body = await req.json().catch(() => ({}));
    const publishNow = body.publishNow !== false; // Default: publish directly!

    const item = await prisma.curatedNewsQueue.findUnique({ where: { id } });
    if (!item) return NextResponse.json({ error: 'Queue item not found' }, { status: 404 });

    // 1. Resolve Category
    let category = await prisma.category.findUnique({
      where: { slug: item.generatedCategory },
    });
    if (!category) {
      category = await prisma.category.findFirst({ where: { parentId: null } });
    }
    const categoryId = category?.id || 1;

    // 2. Resolve Author (First author or Editorial Newsroom)
    let author = await prisma.author.findFirst({ orderBy: { id: 'asc' } });
    if (!author) {
      author = await prisma.author.create({
        data: {
          name: 'NusaLensa Editorial Board',
          slug: 'nusalensa-editorial',
          role: 'Technology Newsroom',
          email: 'editorial@nusalensa.com',
        },
      });
    }

    // 3. Ensure Unique Slug
    let baseSlug = item.generatedSlug || slugify(item.generatedTitle);
    let finalSlug = baseSlug;
    let counter = 1;
    while (await prisma.article.findUnique({ where: { slug: finalSlug } })) {
      finalSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    // 4. Resolve Tags
    const tagNames = item.generatedTags
      ? item.generatedTags.split(',').map((t) => t.trim()).filter(Boolean)
      : ['Global Tech', 'Breaking News'];

    const tagConnections = [];
    for (const tagName of tagNames) {
      const tagSlug = slugify(tagName);
      let tag = await prisma.tag.findUnique({ where: { slug: tagSlug } });
      if (!tag) {
        tag = await prisma.tag.create({
          data: { name: tagName, slug: tagSlug, isTopic: false },
        });
      }
      tagConnections.push({ id: tag.id });
    }

    // 5. Create Article in NusaLensa Database
    const article = await prisma.article.create({
      data: {
        title: item.generatedTitle,
        slug: finalSlug,
        excerpt: item.generatedExcerpt,
        content: item.generatedContent,
        featuredImage: item.sourceImage || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80',
        imageAltText: `Coverage documentation for ${item.generatedTitle}`,
        imageCaption: `Hardware reporting and technical analysis for ${item.generatedTitle.slice(0, 70)} by NusaLensa Newsroom.`,
        imageSource: `Courtesy ${item.sourceName}`,
        authorId: author.id,
        categoryId: categoryId,
        articleType: 'NEWS',
        status: publishNow ? 'PUBLISHED' : 'DRAFT',
        isNews: true,
        isFeatured: false,
        isTrending: publishNow,
        canonicalUrl: item.sourceUrl,
        seoTitle: item.seoTitle,
        seoDescription: item.seoDescription,
        faqs: item.faqJson,
        sources: item.sourcesJson,
        readingTime: Math.max(Math.ceil(item.generatedContent.split(/\s+/).length / 200), 2),
        publishedAt: new Date(),
        tags: {
          connect: tagConnections,
        },
      },
      include: {
        category: true,
      },
    });

    // 6. Update Queue item
    await prisma.curatedNewsQueue.update({
      where: { id },
      data: {
        status: 'APPROVED',
        articleId: article.id,
      },
    });

    // Trigger On-Demand ISR revalidation for homepage
    if (publishNow) {
      revalidateHomepageAndNews();
    }

    const statusMsg = publishNow
      ? `Successfully published live to NusaLensa! Accessible at /${article.category.slug}/${article.slug}`
      : `Successfully saved as Draft in Admin CMS (ID: ${article.id}).`;

    return NextResponse.json({
      success: true,
      message: statusMsg,
      article,
    });
  } catch (error: any) {
    console.error('Error approving curated news:', error);
    return NextResponse.json({ error: error.message || 'Failed to approve article' }, { status: 500 });
  }
}

