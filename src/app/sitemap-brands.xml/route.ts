import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { siteConfig } from '@/lib/siteConfig';

export async function GET() {
  const brands = await prisma.brand.findMany({
    select: {
      slug: true,
      updatedAt: true,
    },
    orderBy: { name: 'asc' },
  });

  const urlEntries = brands
    .map(
      (b) => `  <url>
    <loc>${siteConfig.url}/brands/${b.slug}</loc>
    <lastmod>${new Date(b.updatedAt).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
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

