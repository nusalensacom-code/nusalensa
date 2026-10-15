import { revalidatePath } from 'next/cache';
import fs from 'fs';
import path from 'path';

/**
 * Triggers On-Demand ISR Revalidation for Homepage, News feed, and XML Sitemaps.
 * Ensures that whenever a new article is posted (via cron, GSMArena fetch, or CMS admin),
 * Next.js instantly purges the cached static pages and updates the XML sitemaps
 * so Googlebot and search engines immediately discover and index the new content.
 */
export function revalidateHomepageAndNews() {
  try {
    revalidatePath('/');
    revalidatePath('/news');
    revalidatePath('/sitemap.xml');
    revalidatePath('/sitemap-news.xml');
    revalidatePath('/sitemap-articles.xml');
    revalidatePath('/sitemap-devices.xml');
    revalidatePath('/sitemap-brands.xml');
    revalidatePath('/sitemap-categories.xml');
    revalidatePath('/sitemap-topics.xml');
    revalidatePath('/sitemap-pages.xml');
    revalidatePath('/rss.xml');
    console.log('[Cache] On-demand revalidation executed for homepage, news, and sitemaps');

    // Asynchronously regenerate disk sitemaps if running in Node environment
    try {
      const sitemapScript = path.resolve(process.cwd(), 'scripts', 'generate-sitemap.js');
      if (fs.existsSync(sitemapScript)) {
        const { generateAllSitemaps } = require(sitemapScript);
        if (typeof generateAllSitemaps === 'function') {
          generateAllSitemaps().catch((e: any) =>
            console.warn('[Sitemap] Background sitemap sync notice:', e.message)
          );
        }
      }
    } catch (e: any) {
      console.warn('[Sitemap] Could not invoke generateAllSitemaps:', e.message);
    }
  } catch (err: any) {
    console.warn('[Cache] Revalidation skipped or outside request context:', err.message);
  }
}
