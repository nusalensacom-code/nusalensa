import { revalidatePath } from 'next/cache';

/**
 * Triggers On-Demand ISR Revalidation for Homepage and News feed.
 * Ensures that whenever a new article is posted (via cron, GSMArena fetch, or CMS admin),
 * Next.js instantly purges the cached static homepage and regenerates it with the latest article.
 */
export function revalidateHomepageAndNews() {
  try {
    revalidatePath('/');
    revalidatePath('/news');
    revalidatePath('/sitemap.xml');
    revalidatePath('/sitemap-news.xml');
    console.log('[Cache] On-demand revalidation executed for homepage ("/") and news ("/news")');
  } catch (err: any) {
    console.warn('[Cache] Revalidation skipped or outside request context:', err.message);
  }
}

