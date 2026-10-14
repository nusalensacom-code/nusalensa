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
  const devices = await prisma.device.findMany({
    select: {
      name: true,
      slug: true,
      featuredImage: true,
      updatedAt: true,
      brand: {
        select: {
          slug: true,
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  const urlEntries = devices
    .map((d) => {
      const devUrl = `${siteConfig.url}/phones/${d.brand.slug}/${d.slug}`;
      const lastMod = new Date(d.updatedAt).toISOString();
      const title = escapeXml(d.name);
      const imgTag = d.featuredImage
        ? `\n    <image:image>\n      <image:loc>${escapeXml(d.featuredImage)}</image:loc>\n      <image:title>${title}</image:title>\n    </image:image>`
        : '';

      return `  <url>
    <loc>${devUrl}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.85</priority>${imgTag}
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
