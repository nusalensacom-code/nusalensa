import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminAuth } from '@/lib/adminAuth';
import { slugify } from '@/lib/utils';
import { revalidateHomepageAndNews } from '@/lib/revalidate';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const auth = requireAdminAuth(req, ['SUPER_ADMIN', 'ADMIN', 'EDITOR']);
    if (auth instanceof NextResponse) return auth;

    // Find all pending items
    const pendingItems = await prisma.curatedNewsQueue.findMany({
      where: { status: 'PENDING_REVIEW' },
      take: 50,
      orderBy: { createdAt: 'desc' },
    });

    if (pendingItems.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No review items are pending approval.',
        approvedCount: 0,
      });
    }

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

    let approvedCount = 0;

    for (const item of pendingItems) {
      try {
        let category = await prisma.category.findUnique({
          where: { slug: item.generatedCategory },
        });
        if (!category) {
          category = await prisma.category.findFirst({ where: { parentId: null } });
        }
        const categoryId = category?.id || 1;

        let baseSlug = item.generatedSlug || slugify(item.generatedTitle);
        let finalSlug = baseSlug;
        let counter = 1;
        while (await prisma.article.findUnique({ where: { slug: finalSlug } })) {
          finalSlug = `${baseSlug}-${counter}`;
          counter++;
        }

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

        const article = await prisma.article.create({
          data: {
            title: item.generatedTitle,
            slug: finalSlug,
            excerpt: item.generatedExcerpt,
            content: item.generatedContent,
            featuredImage: item.sourceImage || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80',
            imageAltText: `Coverage documentation for ${item.generatedTitle}`,
            imageCaption: `Latest reporting and technical analysis for ${item.generatedTitle.slice(0, 70)} by NusaLensa Editorial.`,
            imageSource: `Courtesy ${item.sourceName}`,
            authorId: author.id,
            categoryId: categoryId,
            articleType: 'NEWS',
            status: 'PUBLISHED',
            isNews: true,
            isFeatured: false,
            isTrending: true,
            canonicalUrl: item.sourceUrl,
            seoTitle: item.seoTitle,
            seoDescription: item.seoDescription,
            faqs: item.faqJson,
            sources: item.sourcesJson,
            readingTime: Math.max(Math.ceil(item.generatedContent.split(/\s+/).length / 200), 2),
            publishedAt: new Date(),
            tags: { connect: tagConnections },
          },
        });

        await prisma.curatedNewsQueue.update({
          where: { id: item.id },
          data: {
            status: 'APPROVED',
            articleId: article.id,
          },
        });

        approvedCount++;
      } catch (itemErr: any) {
        console.warn(`Error auto-approving item ${item.id}:`, itemErr.message);
      }
    }

    if (approvedCount > 0) {
      revalidateHomepageAndNews();
    }

    return NextResponse.json({
      success: true,
      message: `Successfully approved and published ${approvedCount} articles to NusaLensa!`,
      approvedCount,
    });
  } catch (error: any) {
    console.error('Error approving all curated news:', error);
    return NextResponse.json({ error: error.message || 'Failed to process bulk approval' }, { status: 500 });
  }
}

