import { NextResponse } from 'next/server';
import { siteConfig } from '@/lib/siteConfig';

export async function GET() {
  const currentDate = new Date().toISOString();

  const staticPages = [
    { url: '', priority: '1.0', changefreq: 'always' },
    { url: '/phones', priority: '0.9', changefreq: 'daily' },
    { url: '/tablets', priority: '0.9', changefreq: 'daily' },
    { url: '/compare', priority: '0.9', changefreq: 'daily' },
    { url: '/brands', priority: '0.8', changefreq: 'weekly' },
    { url: '/trending', priority: '0.8', changefreq: 'hourly' },
    { url: '/about', priority: '0.6', changefreq: 'monthly' },
    { url: '/editorial-policy', priority: '0.6', changefreq: 'monthly' },
    { url: '/corrections-policy', priority: '0.6', changefreq: 'monthly' },
    { url: '/advertising-disclosure', priority: '0.6', changefreq: 'monthly' },
    { url: '/contact', priority: '0.6', changefreq: 'monthly' },
    { url: '/privacy-policy', priority: '0.4', changefreq: 'yearly' },
    { url: '/terms', priority: '0.4', changefreq: 'yearly' },
    { url: '/disclaimer', priority: '0.4', changefreq: 'yearly' },
  ];

  const urlEntries = staticPages
    .map(
      (p) => `  <url>
    <loc>${siteConfig.url}${p.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`
    )
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}

