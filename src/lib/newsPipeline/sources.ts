import { prisma } from '@/lib/prisma';

export interface DefaultSource {
  name: string;
  url: string;
  categoryHint: string;
}

export const DEFAULT_NEWS_SOURCES: DefaultSource[] = [
  // 1. Premier International Technology Publications
  {
    name: 'The Verge - Tech & Mobile',
    url: 'https://www.theverge.com/rss/index.xml',
    categoryHint: 'smartphones',
  },
  {
    name: 'Ars Technica - Technology Lab',
    url: 'https://feeds.arstechnica.com/arstechnica/index',
    categoryHint: 'technology',
  },
  {
    name: 'TechCrunch - Mobile & Devices',
    url: 'https://techcrunch.com/category/hardware/feed/',
    categoryHint: 'technology',
  },
  {
    name: 'GSMArena - Smartphone News',
    url: 'https://www.gsmarena.com/rss-news-reviews.php3',
    categoryHint: 'smartphones',
  },
  {
    name: 'Android Authority - Android & Hardware',
    url: 'https://www.androidauthority.com/feed/',
    categoryHint: 'smartphones',
  },
  {
    name: '9to5Google - Google, Pixel & Android Ecosystem',
    url: 'https://9to5google.com/feed/',
    categoryHint: 'smartphones',
  },
  {
    name: '9to5Mac - Apple & iOS Ecosystem',
    url: 'https://9to5mac.com/feed/',
    categoryHint: 'smartphones',
  },
  {
    name: 'Engadget - Consumer Electronics',
    url: 'https://www.engadget.com/rss.xml',
    categoryHint: 'gadgets',
  },

  // 2. Official Manufacturer Newsrooms & Press Releases
  {
    name: 'Apple Newsroom - Official Releases',
    url: 'https://www.apple.com/newsroom/rss-feed.rss',
    categoryHint: 'smartphones',
  },
  {
    name: 'Google The Keyword - Official Blog',
    url: 'https://blog.google/rss/',
    categoryHint: 'technology',
  },
];

/**
 * Ensures reputable international technology sources are registered in database
 */
export async function seedDefaultNewsSources() {
  for (const src of DEFAULT_NEWS_SOURCES) {
    const existing = await prisma.newsSource.findUnique({
      where: { url: src.url },
    });

    if (!existing) {
      await prisma.newsSource.create({
        data: {
          name: src.name,
          url: src.url,
          categoryHint: src.categoryHint,
          isActive: true,
        },
      });
    }
  }
}
