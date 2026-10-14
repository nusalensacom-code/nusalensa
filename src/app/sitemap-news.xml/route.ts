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
  const recentNews = await prisma.article.findMany({
    where: { status: 'PUBLISHED' },
    select: {
      title: true,
      slug: true,
      featuredImage: true,
      publishedAt: true,
      category: { select: { slug: true } },
    },
    orderBy: { publishedAt: 'desc' },
    take: 100,
  });

  const urlEntries = recentNews
    .map((a) => {
      const artUrl = `${siteConfig.url}/${a.category.slug}/${a.slug}`;
      const pubDate = new Date(a.publishedAt).toISOString();
      const title = escapeXml(a.title);
      const imgUrl = escapeXml(a.featuredImage);

      return `  <url>
    <loc>${artUrl}</loc>
    <news:news>
      <news:publication>
        <news:name>NusaLensa</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${pubDate}</news:publication_date>
      <news:title>${title}</news:title>
    </news:news>
    <image:image>
      <image:loc>${imgUrl}</image:loc>
      <image:title>${title}</image:title>
    </image:image>
  </url>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
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

