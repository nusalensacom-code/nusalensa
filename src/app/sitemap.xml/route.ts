import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const filePath = path.join(process.cwd(), 'public', 'sitemap.xml');
  if (fs.existsSync(filePath)) {
    const xml = fs.readFileSync(filePath, 'utf8');
    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  }

  const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://nusalensa.com/sitemap-news.xml</loc>
  </sitemap>
  <sitemap>
    <loc>https://nusalensa.com/sitemap-articles.xml</loc>
  </sitemap>
  <sitemap>
    <loc>https://nusalensa.com/sitemap-devices.xml</loc>
  </sitemap>
  <sitemap>
    <loc>https://nusalensa.com/sitemap-brands.xml</loc>
  </sitemap>
  <sitemap>
    <loc>https://nusalensa.com/sitemap-categories.xml</loc>
  </sitemap>
  <sitemap>
    <loc>https://nusalensa.com/sitemap-topics.xml</loc>
  </sitemap>
  <sitemap>
    <loc>https://nusalensa.com/sitemap-pages.xml</loc>
  </sitemap>
</sitemapindex>`;

  return new NextResponse(sitemapIndex, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}
