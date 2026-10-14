import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { siteConfig } from '@/lib/siteConfig';

function escapeXml(str: string): string {
  if (!str) return '';
  return str
    .toString()
    .replace(/&amp;/g, '&')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const articles = await prisma.article.findMany({
    where: { status: 'PUBLISHED' },
    select: {
      title: true,
      slug: true,
      featuredImage: true,
      isFeatured: true,
      isTrending: true,
      updatedAt: true,
      publishedAt: true,
      category: { select: { slug: true } },
    },
    orderBy: { publishedAt: 'desc' },
  });

  const urlEntries = articles
    .map((a) => {
      const artUrl = `${siteConfig.url}/${a.category.slug}/${a.slug}`;
      const lastMod = new Date(a.updatedAt || a.publishedAt).toISOString();
      const priority = a.isFeatured || a.isTrending ? '1.0' : '0.9';
      const title = escapeXml(a.title);
      const imgUrl = escapeXml(a.featuredImage);

      return `  <url>
    <loc>${artUrl}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>${priority}</priority>
    <image:image>
      <image:loc>${imgUrl}</image:loc>
      <image:title>${title}</image:title>
    </image:image>
  </url>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urlEntries}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=1800, s-maxage=3600',
    },
  });
}

