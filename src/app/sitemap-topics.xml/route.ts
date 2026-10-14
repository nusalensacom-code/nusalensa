import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { siteConfig } from '@/lib/siteConfig';

export async function GET() {
  const topics = await prisma.tag.findMany({
    select: {
      slug: true,
      createdAt: true,
    },
    orderBy: { name: 'asc' },
  });

  const urlEntries = topics
    .map(
      (t) => `  <url>
    <loc>${siteConfig.url}/topic/${t.slug}</loc>
    <lastmod>${new Date(t.createdAt).toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
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
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}

