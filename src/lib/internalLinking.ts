import { prisma } from './prisma';

interface InternalLinkingOptions {
  articleId: number;
  categoryId: number;
  subcategoryId?: number | null;
  primaryTopicId?: number | null;
  tagIds?: number[];
  manualRelatedIds?: string | null;
  limit?: number;
}

export async function getRelatedArticles({
  articleId,
  categoryId,
  subcategoryId,
  primaryTopicId,
  tagIds = [],
  manualRelatedIds,
  limit = 4,
}: InternalLinkingOptions) {
  // 1. Check if Editor specified manual overrides
  if (manualRelatedIds) {
    try {
      const parsedIds: number[] = JSON.parse(manualRelatedIds);
      if (Array.isArray(parsedIds) && parsedIds.length > 0) {
        const manualArticles = await prisma.article.findMany({
          where: {
            id: { in: parsedIds, not: articleId },
            status: 'PUBLISHED',
          },
          include: {
            category: true,
            author: true,
          },
        });

        if (manualArticles.length >= limit) {
          return manualArticles.slice(0, limit);
        }

        // If manual overrides are less than limit, fill remainder with algorithmic matches
        const remainderLimit = limit - manualArticles.length;
        const remainingArticles = await fetchAlgorithmicRelated({
          articleId,
          categoryId,
          subcategoryId,
          primaryTopicId,
          tagIds,
          excludeIds: [...parsedIds, articleId],
          limit: remainderLimit,
        });

        return [...manualArticles, ...remainingArticles];
      }
    } catch (e) {
      // Fallback if parsing fails
    }
  }

  // 2. Pure algorithmic relevance
  return fetchAlgorithmicRelated({
    articleId,
    categoryId,
    subcategoryId,
    primaryTopicId,
    tagIds,
    excludeIds: [articleId],
    limit,
  });
}

async function fetchAlgorithmicRelated({
  articleId,
  categoryId,
  subcategoryId,
  primaryTopicId,
  tagIds,
  excludeIds = [],
  limit = 4,
}: {
  articleId: number;
  categoryId: number;
  subcategoryId?: number | null;
  primaryTopicId?: number | null;
  tagIds: number[];
  excludeIds: number[];
  limit: number;
}) {
  // Priority 1: Articles matching primary topic
  if (primaryTopicId) {
    const topicMatches = await prisma.article.findMany({
      where: {
        status: 'PUBLISHED',
        id: { notIn: excludeIds },
        primaryTopicId,
      },
      orderBy: { publishedAt: 'desc' },
      take: limit,
      include: { category: true, author: true },
    });

    if (topicMatches.length >= limit) {
      return topicMatches;
    }
  }

  // Priority 2: Articles matching subcategory or tags
  const matched = await prisma.article.findMany({
    where: {
      status: 'PUBLISHED',
      id: { notIn: excludeIds },
      OR: [
        ...(subcategoryId ? [{ subcategoryId }] : []),
        { categoryId },
        ...(tagIds.length > 0 ? [{ tags: { some: { id: { in: tagIds } } } }] : []),
      ],
    },
    orderBy: { publishedAt: 'desc' },
    take: limit,
    include: {
      category: true,
      author: true,
    },
  });

  return matched;
}

/**
 * Get In-Article "Baca Juga" recommendation
 */
export async function getInArticleRecommendation(
  articleId: number,
  categoryId: number,
  primaryTopicId?: number | null
) {
  const recommendation = await prisma.article.findFirst({
    where: {
      status: 'PUBLISHED',
      id: { not: articleId },
      OR: [
        ...(primaryTopicId ? [{ primaryTopicId }] : []),
        { categoryId },
      ],
    },
    orderBy: { views: 'desc' },
    select: {
      id: true,
      title: true,
      slug: true,
      category: { select: { slug: true, name: true } },
    },
  });

  return recommendation;
}

