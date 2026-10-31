import { prisma } from '@/lib/prisma';
import { seedDefaultNewsSources } from './sources';
import { fetchNewsFeed, RawNewsArticle } from './fetcher';
import { checkDuplicate } from './deduplicator';
import { classifyNews } from './classifier';
import { generateAiNewsDraft } from './aiGenerator';
import { generateSeoPackage } from './seoGenerator';
import { revalidateHomepageAndNews } from '@/lib/revalidate';
import { getMatchedEditorialImage } from '@/lib/aiWriter/imageMatcher';

export interface PipelineExecutionReport {
  sourcesScanned: number;
  totalFetched: number;
  duplicatesSkipped: number;
  newDraftsCreated: number;
  errors: string[];
}

/**
 * Runs the automated news intake pipeline for international technology publications:
 * NEWS SOURCE -> Feed Fetcher -> Deduplication -> Taxonomy Classification -> AI Draft & Outlines -> SEO -> Curated News Review Queue
 */
export async function runNewsPipeline(options: { maxItemsPerSource?: number; forceSeed?: boolean; autoPublish?: boolean } = {}): Promise<PipelineExecutionReport> {
  const report: PipelineExecutionReport = {
    sourcesScanned: 0,
    totalFetched: 0,
    duplicatesSkipped: 0,
    newDraftsCreated: 0,
    errors: [],
  };

  try {
    // 1. Ensure default international technology sources exist
    await seedDefaultNewsSources();

    // 2. Fetch active sources from database
    const sources = await prisma.newsSource.findMany({
      where: { isActive: true },
      orderBy: { id: 'asc' },
    });

    report.sourcesScanned = sources.length;

    for (const src of sources) {
      try {
        console.log(`[NewsPipeline] Ingesting feed from ${src.name} (${src.url})...`);
        const rawArticles = await fetchNewsFeed(src.url, src.name, src.id);
        report.totalFetched += rawArticles.length;

        const maxPerFeed = options.maxItemsPerSource || 5;
        let processedFromThisFeed = 0;

        for (const raw of rawArticles) {
          if (processedFromThisFeed >= maxPerFeed) break;

          // 3. Deduplication Check
          const dupCheck = await checkDuplicate(raw);
          if (dupCheck.isDuplicate) {
            report.duplicatesSkipped++;
            continue;
          }

          // 4. Category Classification
          const classification = await classifyNews(raw.title, raw.summary, src.categoryHint || undefined);

          // 5. AI Draft Generator (English Technology Journalism)
          const aiDraft = await generateAiNewsDraft(
            raw.title,
            raw.summary,
            raw.sourceName,
            raw.url,
            classification.categoryName
          );

          // 6. SEO Package Generator
          const seoPkg = generateSeoPackage(
            aiDraft.title,
            aiDraft.excerpt,
            aiDraft.content,
            classification.categoryName,
            raw.sourceName,
            raw.imageUrl,
            aiDraft.faqs.length > 0,
            aiDraft.sources.length > 0
          );

          // Fallback image
          const finalImage =
            raw.imageUrl ||
            getMatchedEditorialImage(aiDraft.title || classification.categoryName, 'NEWS').url;

          let publishedArticleId: number | null = null;

          // Auto-publishing is strictly controlled (editorial review required by default)
          if (options.autoPublish) {
            try {
              let category = await prisma.category.findUnique({
                where: { slug: classification.categorySlug },
              });
              if (!category) {
                category = await prisma.category.findFirst({ where: { parentId: null } });
              }
              const categoryId = category?.id || 1;

              // Find or create editorial newsroom author
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

              let finalSlug = seoPkg.slug;
              let slugCounter = 1;
              while (await prisma.article.findUnique({ where: { slug: finalSlug } })) {
                finalSlug = `${seoPkg.slug}-${slugCounter}`;
                slugCounter++;
              }

              const tagConnections = [];
              for (const tagName of classification.suggestedTags) {
                const tSlug = tagName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                let tag = await prisma.tag.findUnique({ where: { slug: tSlug } });
                if (!tag) {
                  tag = await prisma.tag.create({
                    data: { name: tagName, slug: tSlug, isTopic: false },
                  });
                }
                tagConnections.push({ id: tag.id });
              }

              const article = await prisma.article.create({
                data: {
                  title: aiDraft.title,
                  slug: finalSlug,
                  excerpt: aiDraft.excerpt,
                  content: aiDraft.content,
                  featuredImage: finalImage,
                  imageAltText: `Documentation coverage for ${aiDraft.title}`,
                  imageCaption: `Hardware reporting and technical analysis for ${aiDraft.title.slice(0, 70)} by NusaLensa Newsroom.`,
                  imageSource: `Source: ${raw.sourceName}`,
                  authorId: author.id,
                  categoryId: categoryId,
                  articleType: 'NEWS',
                  status: 'PUBLISHED',
                  isNews: true,
                  isFeatured: false,
                  isTrending: true,
                  canonicalUrl: raw.url,
                  seoTitle: seoPkg.seoTitle,
                  seoDescription: seoPkg.seoDescription,
                  faqs: JSON.stringify(aiDraft.faqs),
                  sources: JSON.stringify(aiDraft.sources),
                  readingTime: Math.max(Math.ceil(aiDraft.content.split(/\s+/).length / 200), 4),
                  publishedAt: raw.publishedAt || new Date(),
                  tags: { connect: tagConnections },
                },
              });

              publishedArticleId = article.id;
            } catch (err: any) {
              console.warn('[NewsPipeline] Publishing note:', err.message);
            }
          }

          // 7. Save to CuratedNewsQueue with AI Assist fields
          await prisma.curatedNewsQueue.upsert({
            where: { urlHash: dupCheck.urlHash },
            update: {
              status: options.autoPublish ? 'APPROVED' : undefined,
              articleId: publishedArticleId || undefined,
            },
            create: {
              sourceId: src.id,
              sourceName: raw.sourceName,
              sourceUrl: raw.url,
              sourceTitle: raw.title,
              sourceSummary: raw.summary,
              sourceImage: finalImage,
              sourcePublishedAt: raw.publishedAt,
              urlHash: dupCheck.urlHash,

              generatedTitle: aiDraft.title,
              generatedSlug: seoPkg.slug,
              generatedExcerpt: aiDraft.excerpt,
              generatedContent: aiDraft.content,
              generatedCategory: classification.categorySlug,
              generatedTags: classification.suggestedTags.join(', '),
              seoTitle: seoPkg.seoTitle,
              seoDescription: seoPkg.seoDescription,
              seoScore: seoPkg.seoScore,
              faqJson: JSON.stringify(aiDraft.faqs),
              sourcesJson: JSON.stringify(aiDraft.sources),
              headlineSuggestions: JSON.stringify(aiDraft.headlineSuggestions || []),
              outlineJson: JSON.stringify(aiDraft.outline || []),
              factCheckChecklist: JSON.stringify(aiDraft.factCheckChecklist || []),
              missingCitations: JSON.stringify(aiDraft.missingCitations || []),

              status: options.autoPublish ? 'APPROVED' : 'PENDING_REVIEW',
              articleId: publishedArticleId,
            },
          });

          processedFromThisFeed++;
          report.newDraftsCreated++;
        }

        // Update fetch stats
        await prisma.newsSource.update({
          where: { id: src.id },
          data: {
            lastFetchedAt: new Date(),
            fetchCount: { increment: rawArticles.length },
          },
        });
      } catch (feedError: any) {
        report.errors.push(`Failed to ingest from source ${src.name}: ${feedError.message}`);
      }
    }

    // Trigger on-demand cache revalidation for homepage if new stories were published
    if (options.autoPublish && report.newDraftsCreated > 0) {
      revalidateHomepageAndNews();
    }

    return report;
  } catch (globalError: any) {
    report.errors.push(`Global news pipeline error: ${globalError.message}`);
    return report;
  }
}
