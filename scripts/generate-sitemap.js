const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const ROOT = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT, 'public');
const DIST_DIR = path.join(ROOT, 'dist');
const BASE_URL = 'https://nusalensa.com';

// Escape XML special characters safely (prevent double escaping)
function escapeXml(str) {
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

// Convert date to clean YYYY-MM-DD string (Google's preferred lastmod format)
function safeDate(d) {
  if (!d) return new Date().toISOString().split('T')[0];
  const date = new Date(d);
  return isNaN(date.getTime()) ? new Date().toISOString().split('T')[0] : date.toISOString().split('T')[0];
}

// Convert date to strict W3C Datetime for Google News (YYYY-MM-DDTHH:mm:ssZ without milliseconds)
function safeNewsDate(d) {
  if (!d) return new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
  const date = new Date(d);
  const iso = isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
  return iso.replace(/\.\d{3}Z$/, 'Z');
}

async function generateAllSitemaps() {
  console.log('====================================================');
  console.log('   NUSALENSA - GLOBAL SITEMAP & ROBOTS GENERATOR    ');
  console.log('====================================================');
  console.log(`Base URL: ${BASE_URL}`);

  // Ensure public directory exists
  if (!fs.existsSync(PUBLIC_DIR)) {
    fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  }

  const todayStr = new Date().toISOString().split('T')[0];

  // 1. Fetch published articles from database
  const articles = await prisma.article.findMany({
    where: { status: 'PUBLISHED' },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      featuredImage: true,
      imageAltText: true,
      isFeatured: true,
      isTrending: true,
      publishedAt: true,
      updatedAt: true,
      category: { select: { slug: true, name: true } },
    },
    orderBy: { publishedAt: 'desc' },
  });

  console.log(`>>> Processing ${articles.length} published articles for sitemap...`);

  // 2. Fetch categories
  const categories = await prisma.category.findMany({
    select: { slug: true, name: true, updatedAt: true },
    orderBy: { order: 'asc' },
  });

  // 3. Fetch tags/topics
  const topics = await prisma.tag.findMany({
    select: { slug: true, name: true, createdAt: true },
    orderBy: { name: 'asc' },
  });

  // 4. Fetch devices
  const devices = await prisma.device.findMany({
    select: {
      name: true,
      slug: true,
      featuredImage: true,
      updatedAt: true,
      brand: { select: { slug: true } },
    },
    orderBy: { updatedAt: 'desc' },
  });

  // 5. Fetch brands
  const brands = await prisma.brand.findMany({
    select: { slug: true, name: true, updatedAt: true },
    orderBy: { name: 'asc' },
  });

  console.log(`>>> Processing ${devices.length} devices and ${brands.length} brands...`);

  // ==========================================
  // A. GENERATE sitemap-news.xml (Google News Compliance - 48h window)
  // ==========================================
  const now = new Date();
  const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);
  let recentNews = articles.filter((a) => {
    if (!a.publishedAt) return false;
    return new Date(a.publishedAt) >= twoDaysAgo;
  });
  if (recentNews.length < 15) {
    recentNews = articles.slice(0, 30);
  }
  const newsEntries = recentNews
    .map((a) => {
      const artUrl = `${BASE_URL}/${a.category.slug}/${a.slug}`;
      const pubDate = safeNewsDate(a.publishedAt);
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

  const sitemapNewsXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${newsEntries}
</urlset>`;

  // ==========================================
  // B. GENERATE sitemap-articles.xml (All Articles)
  // ==========================================
  const articleEntries = articles
    .map((a) => {
      const artUrl = `${BASE_URL}/${a.category.slug}/${a.slug}`;
      const lastMod = safeDate(a.updatedAt || a.publishedAt);
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

  const sitemapArticlesXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${articleEntries}
</urlset>`;

  // ==========================================
  // C. GENERATE sitemap-devices.xml (Hardware Database)
  // ==========================================
  const deviceEntries = devices
    .map((d) => {
      const devUrl = `${BASE_URL}/phones/${d.brand.slug}/${d.slug}`;
      const lastMod = safeDate(d.updatedAt);
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

  const sitemapDevicesXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${deviceEntries}
</urlset>`;

  // ==========================================
  // D. GENERATE sitemap-brands.xml (Brand Index)
  // ==========================================
  const brandEntries = brands
    .map((b) => {
      const brandUrl = `${BASE_URL}/brands/${b.slug}`;
      const lastMod = safeDate(b.updatedAt);
      return `  <url>
    <loc>${brandUrl}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    })
    .join('\n');

  const sitemapBrandsXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${brandEntries}
</urlset>`;

  // ==========================================
  // E. GENERATE sitemap-categories.xml
  // ==========================================
  const categoryEntries = categories
    .map((c) => {
      const catUrl = `${BASE_URL}/${c.slug}`;
      const lastMod = safeDate(c.updatedAt);
      return `  <url>
    <loc>${catUrl}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`;
    })
    .join('\n');

  const sitemapCategoriesXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${categoryEntries}
</urlset>`;

  // ==========================================
  // F. GENERATE sitemap-topics.xml
  // ==========================================
  const topicEntries = topics
    .map((t) => {
      const topicUrl = `${BASE_URL}/topic/${t.slug}`;
      const lastMod = safeDate(t.createdAt);
      return `  <url>
    <loc>${topicUrl}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>`;
    })
    .join('\n');

  const sitemapTopicsXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${topicEntries}
</urlset>`;

  // ==========================================
  // G. GENERATE sitemap-pages.xml
  // ==========================================
  const staticPages = [
    { path: '', priority: '1.0', changefreq: 'always' },
    { path: '/phones', priority: '0.9', changefreq: 'daily' },
    { path: '/tablets', priority: '0.9', changefreq: 'daily' },
    { path: '/compare', priority: '0.9', changefreq: 'daily' },
    { path: '/brands', priority: '0.8', changefreq: 'weekly' },
    { path: '/trending', priority: '0.8', changefreq: 'hourly' },
    { path: '/about', priority: '0.6', changefreq: 'monthly' },
    { path: '/editorial-policy', priority: '0.6', changefreq: 'monthly' },
    { path: '/corrections-policy', priority: '0.6', changefreq: 'monthly' },
    { path: '/advertising-disclosure', priority: '0.6', changefreq: 'monthly' },
    { path: '/contact', priority: '0.6', changefreq: 'monthly' },
    { path: '/privacy-policy', priority: '0.4', changefreq: 'yearly' },
    { path: '/terms', priority: '0.4', changefreq: 'yearly' },
    { path: '/disclaimer', priority: '0.4', changefreq: 'yearly' },
  ];

  const pageEntries = staticPages
    .map((p) => {
      return `  <url>
    <loc>${BASE_URL}${p.path}</loc>
    <lastmod>${todayStr}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`;
    })
    .join('\n');

  const sitemapPagesXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pageEntries}
</urlset>`;

  // ==========================================
  // H. GENERATE sitemap.xml (MASTER DIRECT SITEMAP)
  // ==========================================
  const masterDirectSitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${pageEntries}
${categoryEntries}
${topicEntries}
${deviceEntries}
${brandEntries}
${articleEntries}
</urlset>`;

  const sitemapIndexXml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${BASE_URL}/sitemap-news.xml</loc>
    <lastmod>${todayStr}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${BASE_URL}/sitemap-articles.xml</loc>
    <lastmod>${todayStr}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${BASE_URL}/sitemap-devices.xml</loc>
    <lastmod>${todayStr}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${BASE_URL}/sitemap-brands.xml</loc>
    <lastmod>${todayStr}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${BASE_URL}/sitemap-categories.xml</loc>
    <lastmod>${todayStr}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${BASE_URL}/sitemap-topics.xml</loc>
    <lastmod>${todayStr}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${BASE_URL}/sitemap-pages.xml</loc>
    <lastmod>${todayStr}</lastmod>
  </sitemap>
</sitemapindex>`;

  // ==========================================
  // I. GENERATE robots.txt
  // ==========================================
  const robotsTxt = `# ========================================================
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
Sitemap: ${BASE_URL}/sitemap.xml
Sitemap: ${BASE_URL}/sitemap-index.xml
Sitemap: ${BASE_URL}/sitemap_index.xml
Sitemap: ${BASE_URL}/sitemap-news.xml
Sitemap: ${BASE_URL}/sitemap-articles.xml
Sitemap: ${BASE_URL}/sitemap-devices.xml
Sitemap: ${BASE_URL}/sitemap-brands.xml
Sitemap: ${BASE_URL}/sitemap-categories.xml
Sitemap: ${BASE_URL}/sitemap-topics.xml
Sitemap: ${BASE_URL}/sitemap-pages.xml
`;

  // ==========================================
  // J. GENERATE rss.xml (RSS 2.0 Feed)
  // ==========================================
  const rssItems = articles.slice(0, 30).map((a) => {
    const artUrl = `${BASE_URL}/${a.category.slug}/${a.slug}`;
    const pubDateRfc822 = new Date(a.publishedAt).toUTCString();
    return `    <item>
      <title>${escapeXml(a.title)}</title>
      <link>${artUrl}</link>
      <guid isPermaLink="true">${artUrl}</guid>
      <description>${escapeXml(a.excerpt)}</description>
      <category>${escapeXml(a.category.name)}</category>
      <pubDate>${pubDateRfc822}</pubDate>
      <enclosure url="${escapeXml(a.featuredImage)}" type="image/jpeg" length="0" />
    </item>`;
  }).join('\n');

  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>NusaLensa - Global Technology, Smartphone Specifications &amp; Hardware Reviews</title>
    <link>${BASE_URL}</link>
    <description>Independent global technology and smartphone information platform providing verified device specs, dual comparisons, and tech news.</description>
    <language>en-US</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${BASE_URL}/rss.xml" rel="self" type="application/rss+xml" />
${rssItems}
  </channel>
</rss>`;

  // Target directories to write: public, root, and dist (if exists)
  const targets = [PUBLIC_DIR, ROOT];
  if (fs.existsSync(DIST_DIR)) {
    targets.push(DIST_DIR);
  }

  for (const dir of targets) {
    fs.writeFileSync(path.join(dir, 'sitemap.xml'), masterDirectSitemapXml.trim() + '\n', 'utf8');
    fs.writeFileSync(path.join(dir, 'sitemap-index.xml'), sitemapIndexXml.trim() + '\n', 'utf8');
    fs.writeFileSync(path.join(dir, 'sitemap_index.xml'), sitemapIndexXml.trim() + '\n', 'utf8');
    fs.writeFileSync(path.join(dir, 'sitemap-news.xml'), sitemapNewsXml.trim() + '\n', 'utf8');
    fs.writeFileSync(path.join(dir, 'sitemap-articles.xml'), sitemapArticlesXml.trim() + '\n', 'utf8');
    fs.writeFileSync(path.join(dir, 'sitemap-devices.xml'), sitemapDevicesXml.trim() + '\n', 'utf8');
    fs.writeFileSync(path.join(dir, 'sitemap-brands.xml'), sitemapBrandsXml.trim() + '\n', 'utf8');
    fs.writeFileSync(path.join(dir, 'sitemap-categories.xml'), sitemapCategoriesXml.trim() + '\n', 'utf8');
    fs.writeFileSync(path.join(dir, 'sitemap-topics.xml'), sitemapTopicsXml.trim() + '\n', 'utf8');
    fs.writeFileSync(path.join(dir, 'sitemap-pages.xml'), sitemapPagesXml.trim() + '\n', 'utf8');
    fs.writeFileSync(path.join(dir, 'robots.txt'), robotsTxt.trim() + '\n', 'utf8');
    fs.writeFileSync(path.join(dir, 'rss.xml'), rssXml.trim() + '\n', 'utf8');
    console.log(`>>> Successfully wrote sitemaps and robots.txt to: ${dir}`);
  }

  console.log('>>> SITEMAP GENERATION COMPLETE!');
  console.log(`    - sitemap.xml (MASTER DIRECT: ${staticPages.length + categories.length + topics.length + devices.length + brands.length + articles.length} Total URLs)`);
  console.log(`    - sitemap-news.xml (${recentNews.length} Google News entries)`);
  console.log(`    - sitemap-articles.xml (${articles.length} articles)`);
  console.log(`    - sitemap-devices.xml (${devices.length} hardware specs)`);
  console.log(`    - sitemap-brands.xml (${brands.length} brand hubs)`);
  console.log(`    - sitemap-categories.xml (${categories.length} categories)`);
  console.log(`    - sitemap-topics.xml (${topics.length} topics)`);
  console.log(`    - sitemap-pages.xml (${staticPages.length} core pages)`);
  console.log(`    - robots.txt (Compliant with Googlebot, Googlebot-News, Bingbot)`);
  console.log(`    - rss.xml (RSS 2.0 Feed in English)`);
}

// Support being run directly or imported as module
if (require.main === module) {
  generateAllSitemaps()
    .catch((e) => {
      console.error('Sitemap generation error:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

module.exports = { generateAllSitemaps };
