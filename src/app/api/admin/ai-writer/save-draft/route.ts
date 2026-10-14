import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminAuth } from '@/lib/adminAuth';
import { slugify } from '@/lib/utils';
import { countWords } from '@/lib/aiWriter/wordCounter';
import { revalidateHomepageAndNews } from '@/lib/revalidate';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const auth = requireAdminAuth(req, ['SUPER_ADMIN', 'ADMIN', 'EDITOR']);
    if (auth instanceof NextResponse) return auth;

    const body = await req.json().catch(() => ({}));
    const {
      jobId,
      articleId,
      title,
      slug,
      content,
      excerpt,
      featuredImage,
      imageAltText,
      seoTitle,
      seoDescription,
      status = 'DRAFT', // 'DRAFT' or 'PUBLISHED'
      categoryId,
      sources,
      faqs,
      checklist,
    } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required.' }, { status: 400 });
    }

    const wordCount = countWords(content);
    const readingTime = Math.max(Math.ceil(wordCount / 200), 2);
    const finalSlug = slugify(slug || title);

    let updatedArticle;

    if (articleId) {
      // Update existing article
      updatedArticle = await prisma.article.update({
        where: { id: parseInt(String(articleId), 10) },
        data: {
          title,
          slug: finalSlug,
          content,
          excerpt: excerpt || title,
          featuredImage: featuredImage || undefined,
          imageAltText: imageAltText || undefined,
          seoTitle: seoTitle || title,
          seoDescription: seoDescription || excerpt,
          status,
          readingTime,
          categoryId: categoryId ? parseInt(String(categoryId), 10) : undefined,
          sources: sources ? (typeof sources === 'string' ? sources : JSON.stringify(sources)) : undefined,
          faqs: faqs ? (typeof faqs === 'string' ? faqs : JSON.stringify(faqs)) : undefined,
          publishedAt: status === 'PUBLISHED' ? new Date() : undefined,
        },
        include: { category: true },
      });
    } else {
      // Create new article
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

      let category = categoryId
        ? await prisma.category.findUnique({ where: { id: parseInt(String(categoryId), 10) } })
        : await prisma.category.findFirst();

      updatedArticle = await prisma.article.create({
        data: {
          title,
          slug: finalSlug,
          content,
          excerpt: excerpt || title,
          featuredImage: featuredImage || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80',
          imageAltText: imageAltText || title,
          seoTitle: seoTitle || title,
          seoDescription: seoDescription || excerpt,
          authorId: author.id,
          categoryId: category?.id || 1,
          articleType: 'GUIDE',
          status,
          readingTime,
          publishedAt: new Date(),
        },
        include: { category: true },
      });
    }

    // Update job record if jobId provided
    if (jobId) {
      await prisma.aiGenerationJob.update({
        where: { id: parseInt(String(jobId), 10) },
        data: {
          actualWordCount: wordCount,
          generatedTitle: title,
          generatedSlug: finalSlug,
          generatedContent: content,
          generatedExcerpt: excerpt,
          editorialChecklistJson: checklist ? JSON.stringify(checklist) : undefined,
          articleId: updatedArticle.id,
        },
      });
    }

    // If published live, trigger On-Demand ISR Revalidation for Homepage and News feed
    if (status === 'PUBLISHED') {
      revalidateHomepageAndNews();
    }

    return NextResponse.json({
      success: true,
      message: status === 'PUBLISHED' ? 'Article published live to NusaLensa!' : 'Article saved as draft successfully.',
      article: updatedArticle,
      wordCount,
    });
  } catch (error: any) {
    console.error('Save Draft API error:', error);
    return NextResponse.json({ error: error.message || 'Error saving article draft' }, { status: 500 });
  }
}

