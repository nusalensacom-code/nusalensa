import { prisma } from './prisma';

/**
 * Weighted Trending Score Engine
 * Formula: Score = views * (1 / (1 + hoursSincePublished)^0.8)
 * Ensures older articles with high historical views do not permanently dominate trending,
 * while fresh articles with surges of readership rise to the top of the trending index.
 */
export async function getTrendingArticles(limit: number = 10) {
  const candidateArticles = await prisma.article.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { publishedAt: 'desc' },
    take: 40, // Fetch the latest 40 articles to compute dynamic recency scores
    include: {
      category: true,
      author: true,
    },
  });

  const now = Date.now();

  const scoredArticles = candidateArticles.map((article) => {
    const publishedTime = new Date(article.publishedAt).getTime();
    const hoursSincePublished = Math.max(0.1, (now - publishedTime) / (1000 * 60 * 60));

    // Recency decay factor (power of 0.8)
    const recencyFactor = 1 / Math.pow(1 + hoursSincePublished / 12, 0.8);

    // Total view weight (combination of historical views + recent views)
    const effectiveViews = (article.views || 0) + (article.recentViews || 0) * 2;
    const trendingScore = effectiveViews * recencyFactor;

    return {
      ...article,
      trendingScore,
    };
  });

  // Urutkan berdasarkan skor trending tertinggi
  scoredArticles.sort((a, b) => b.trendingScore - a.trendingScore);

  return scoredArticles.slice(0, limit);
}

