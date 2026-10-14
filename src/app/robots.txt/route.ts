import { NextResponse } from 'next/server';
import { siteConfig } from '@/lib/siteConfig';

export async function GET() {
  const robots = `# ========================================================
# NUSALENSA Robots Configuration
# https://nusalensa.com
# Verified compliant with Google, Bing & Major Search Engines
# ========================================================

User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /search
Disallow: /*?*preview=true

# Allow Static Assets for Google Mobile & Desktop Rendering
Allow: /_next/static/
Allow: /static/
Allow: /images/
Allow: /placeholder.svg

User-agent: Googlebot
Allow: /
Disallow: /admin/
Disallow: /api/

User-agent: Googlebot-News
Allow: /
Disallow: /admin/
Disallow: /api/

User-agent: Googlebot-Image
Allow: /
Disallow: /admin/

User-agent: Bingbot
Allow: /
Disallow: /admin/
Disallow: /api/

# Sitemaps
Sitemap: ${siteConfig.url}/sitemap.xml
Sitemap: ${siteConfig.url}/sitemap-news.xml
Sitemap: ${siteConfig.url}/sitemap-articles.xml
Sitemap: ${siteConfig.url}/sitemap-devices.xml
Sitemap: ${siteConfig.url}/sitemap-brands.xml
Sitemap: ${siteConfig.url}/sitemap-categories.xml
Sitemap: ${siteConfig.url}/sitemap-topics.xml
Sitemap: ${siteConfig.url}/sitemap-pages.xml
`;

  return new NextResponse(robots, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
