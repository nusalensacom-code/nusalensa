import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { RawNewsArticle } from './fetcher';

/**
 * Normalizes a URL by stripping tracking parameters, anchors, and trailing slashes
 */
export function normalizeNewsUrl(rawUrl: string): string {
  try {
    const parsed = new URL(rawUrl);
    // Remove common tracking parameters
    const paramsToDelete: string[] = [];
    parsed.searchParams.forEach((_, key) => {
      const lowerKey = key.toLowerCase();
      if (
        lowerKey.startsWith('utm_') ||
        lowerKey === 'ref' ||
        lowerKey === 'fbclid' ||
        lowerKey === 'gclid' ||
        lowerKey === 'source' ||
        lowerKey === 'platform'
      ) {
        paramsToDelete.push(key);
      }
    });

    paramsToDelete.forEach((key) => parsed.searchParams.delete(key));

    let clean = parsed.origin + parsed.pathname;
    if (parsed.searchParams.toString()) {
      clean += '?' + parsed.searchParams.toString();
    }
    return clean.replace(/\/+$/, '');
  } catch (e) {
    return rawUrl.trim().replace(/\/+$/, '');
  }
}

/**
 * Generates SHA-256 hash for a normalized URL
 */
export function generateUrlHash(url: string): string {
  const normalized = normalizeNewsUrl(url);
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

/**
 * Calculates simple token Jaccard similarity between two titles (0.0 to 1.0)
 */
function titleSimilarity(titleA: string, titleB: string): number {
  const wordsA = new Set(
    titleA
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 2)
  );
  const wordsB = new Set(
    titleB
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 2)
  );

  if (wordsA.size === 0 || wordsB.size === 0) return 0;

  let intersectionCount = 0;
  wordsA.forEach((w) => {
    if (wordsB.has(w)) intersectionCount++;
  });

  const unionSize = new Set([...Array.from(wordsA), ...Array.from(wordsB)]).size;
  return intersectionCount / unionSize;
}

export interface DeduplicationResult {
  isDuplicate: boolean;
  reason?: 'EXISTING_QUEUE_URL' | 'EXISTING_ARTICLE_URL' | 'SIMILAR_HEADLINE';
  matchedTitle?: string;
  urlHash: string;
}

/**
 * Checks if a news item is a duplicate in the database
 */
export async function checkDuplicate(article: RawNewsArticle): Promise<DeduplicationResult> {
  const cleanUrl = normalizeNewsUrl(article.url);
  const urlHash = generateUrlHash(cleanUrl);

  // 1. Check in CuratedNewsQueue
  const inQueue = await prisma.curatedNewsQueue.findFirst({
    where: {
      OR: [{ urlHash }, { sourceUrl: cleanUrl }],
    },
  });

  if (inQueue) {
    return {
      isDuplicate: true,
      reason: 'EXISTING_QUEUE_URL',
      matchedTitle: inQueue.sourceTitle,
      urlHash,
    };
  }

  // 2. Check in Published Articles (canonicalUrl or exact title)
  const inArticles = await prisma.article.findFirst({
    where: {
      OR: [
        { canonicalUrl: cleanUrl },
        { title: article.title.trim() },
      ],
    },
  });

  if (inArticles) {
    return {
      isDuplicate: true,
      reason: 'EXISTING_ARTICLE_URL',
      matchedTitle: inArticles.title,
      urlHash,
    };
  }

  // 3. Check for similar headline in the last 48 hours to prevent flood of identical stories
  const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
  const recentArticles = await prisma.article.findMany({
    where: {
      createdAt: { gte: twoDaysAgo },
    },
    select: { title: true },
    take: 40,
  });

  for (const recent of recentArticles) {
    const sim = titleSimilarity(article.title, recent.title);
    if (sim >= 0.8) {
      return {
        isDuplicate: true,
        reason: 'SIMILAR_HEADLINE',
        matchedTitle: recent.title,
        urlHash,
      };
    }
  }

  return {
    isDuplicate: false,
    urlHash,
  };
}

