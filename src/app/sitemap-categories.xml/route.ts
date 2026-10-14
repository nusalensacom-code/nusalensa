import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { siteConfig } from '@/lib/siteConfig';

export async function GET() {
  const categories = await prisma.category.findMany({
    select: {
      slug: true,
      updatedAt: true,
    },
    orderBy: { order: 'asc' },
  });

  const urlEntries = categories
    .map(
      (c) => `  <url>
    <loc>${siteConfig.url}/${c.slug}</loc>
    <lastmod>${new Date(c.updatedAt).toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
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

