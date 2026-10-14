const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const STAGING = 'C:\\Users\\admin\\Desktop\\SIAP_UPLOAD_KE_GITHUB';

const filesToSync = [
  'package.json',
  'scripts/auto-fetch-news.js',
  'scripts/generate-sitemap.js',
  'scripts/prepare-deploy.js',
  'prisma/schema.prisma',
  'prisma/seed.js',
  'prisma/seed-articles.json',
  'public/placeholder.svg',
  'public/robots.txt',
  'public/sitemap.xml',
  'public/sitemap-index.xml',
  'public/sitemap-news.xml',
  'public/sitemap-articles.xml',
  'public/sitemap-categories.xml',
  'public/sitemap-topics.xml',
  'public/sitemap-pages.xml',
  'public/rss.xml',
  'src/lib/utils.ts',
  'src/lib/seo.ts',
  'src/lib/siteConfig.ts',
  'src/lib/newsPipeline/sources.ts',
  'src/lib/newsPipeline/pipeline.ts',
  'src/lib/newsPipeline/aiGenerator.ts',
  'src/components/admin/NewsCuratorManager.tsx',
  'src/components/ui/SafeImage.tsx',
  'src/components/ui/ArticleCard.tsx',
  'src/components/ui/AuthorBox.tsx',
  'src/app/admin/layout.tsx',
  'src/app/admin/login/page.tsx',
  'src/app/admin/articles/[id]/preview/page.tsx',
  'src/app/page.tsx',
  'src/app/author/[slug]/page.tsx',
  'src/app/[category]/[slug]/page.tsx',
  'src/app/api/admin/curator/fetch/route.ts',
  'src/app/api/admin/curator/approve-all/route.ts',
  'src/app/sitemap.xml/route.ts',
  'src/app/sitemap-news.xml/route.ts',
  'src/app/sitemap-articles.xml/route.ts',
  'src/app/robots.txt/route.ts',
  'src/app/layout.tsx',
  '.github/workflows/auto-news-publish.yml',
];

console.log('>>> Menyinkronkan file ke SIAP_UPLOAD_KE_GITHUB...');
let copiedCount = 0;

for (const relPath of filesToSync) {
  const src = path.join(ROOT, relPath);
  const dest = path.join(STAGING, relPath);

  if (fs.existsSync(src)) {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
    console.log(`  [OK] ${relPath}`);
    copiedCount++;
  } else {
    console.warn(`  [MISSING] ${src}`);
  }
}

console.log(`\nSelesai! ${copiedCount} file disinkronkan ke ${STAGING}.`);
