const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const NEXT_DIR = path.join(ROOT, '.next');
const APP_DIR = path.join(NEXT_DIR, 'server', 'app');
const STATIC_DIR = path.join(NEXT_DIR, 'static');
const PUBLIC_DIR = path.join(ROOT, 'public');
const DIST_DIR = path.join(ROOT, 'dist');

console.log('>>> [PREPARE DEPLOY] Building Cloudflare Pages static site bundle...');

// 1. Clean and recreate dist directory
if (fs.existsSync(DIST_DIR)) {
  fs.rmSync(DIST_DIR, { recursive: true, force: true });
}
fs.mkdirSync(DIST_DIR, { recursive: true });

// Recursive copy helper
function copyRecursiveSync(src, dest) {
  if (!fs.existsSync(src)) return;
  const stats = fs.statSync(src);
  if (stats.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const item of fs.readdirSync(src)) {
      copyRecursiveSync(path.join(src, item), path.join(dest, item));
    }
  } else {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

// 2. Copy public directory assets if present
if (fs.existsSync(PUBLIC_DIR)) {
  console.log('>>> Copying public assets...');
  copyRecursiveSync(PUBLIC_DIR, DIST_DIR);
}

// 3. Copy Next.js static assets to _next/static and static
console.log('>>> Copying static assets (_next/static)...');
copyRecursiveSync(STATIC_DIR, path.join(DIST_DIR, '_next', 'static'));
copyRecursiveSync(STATIC_DIR, path.join(DIST_DIR, 'static'));

// 4. Copy all pre-rendered HTML files
console.log('>>> Copying pre-rendered HTML pages...');
let pageCount = 0;

function copyHtml(dir, rel = '') {
  if (!fs.existsSync(dir)) return;
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const full = path.join(dir, item);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      // Don't recurse into non-route folders
      if (item !== 'chunks' && item !== 'css' && item !== 'media') {
        copyHtml(full, path.join(rel, item));
      }
    } else if (item.endsWith('.html')) {
      pageCount++;
      const relFile = path.join(rel, item);
      const targetFile = path.join(DIST_DIR, relFile);
      fs.mkdirSync(path.dirname(targetFile), { recursive: true });
      fs.copyFileSync(full, targetFile);

      // Create pretty URL directory with index.html (e.g. /about -> about/index.html)
      if (item !== 'index.html' && item !== '404.html' && item !== '_not-found.html') {
        const cleanName = item.replace(/\.html$/, '');
        const prettyIndex = path.join(DIST_DIR, rel, cleanName, 'index.html');
        fs.mkdirSync(path.dirname(prettyIndex), { recursive: true });
        fs.copyFileSync(full, prettyIndex);
      }
    }
  }
}

copyHtml(APP_DIR);
console.log(`>>> Successfully processed ${pageCount} HTML pages.`);

// 5. Setup 404 fallback page
const notFoundSrc = path.join(APP_DIR, '_not-found.html');
const notFoundDest = path.join(DIST_DIR, '404.html');
if (fs.existsSync(notFoundSrc) && !fs.existsSync(notFoundDest)) {
  fs.copyFileSync(notFoundSrc, notFoundDest);
}

// 5b. Ensure /admin/index.html exists for Cloudflare Pages admin routing
const adminHtmlSrc = path.join(DIST_DIR, 'admin.html');
const adminIndexDest = path.join(DIST_DIR, 'admin', 'index.html');
if (fs.existsSync(adminHtmlSrc) && !fs.existsSync(adminIndexDest)) {
  fs.mkdirSync(path.join(DIST_DIR, 'admin'), { recursive: true });
  fs.copyFileSync(adminHtmlSrc, adminIndexDest);
}

// 5c. Ensure /admin/ai-writer/index.html exists
const aiWriterHtmlSrc = path.join(DIST_DIR, 'admin', 'ai-writer.html');
const aiWriterIndexDest = path.join(DIST_DIR, 'admin', 'ai-writer', 'index.html');
if (fs.existsSync(aiWriterHtmlSrc) && !fs.existsSync(aiWriterIndexDest)) {
  fs.mkdirSync(path.join(DIST_DIR, 'admin', 'ai-writer'), { recursive: true });
  fs.copyFileSync(aiWriterHtmlSrc, aiWriterIndexDest);
}

// 6. Create Cloudflare Pages _redirects file
const redirectsContent = `# Direct admin routing
/admin/login  /admin/login/index.html  200
/admin/login/  /admin/login/index.html  200
/admin/ai-writer  /admin/ai-writer/index.html  200
/admin/ai-writer/  /admin/ai-writer/index.html  200
/admin/news-curator  /admin/news-curator/index.html  200
/admin/news-curator/  /admin/news-curator/index.html  200

# Canonical tag-to-topic redirects
/tag/:slug  /topic/:slug  301

# Admin SPA routing fallback
/admin/*  /admin/index.html  200
/admin  /admin/index.html  200

# Cloudflare Pages fallback for public routes
/*  /index.html  200
`;
fs.writeFileSync(path.join(DIST_DIR, '_redirects'), redirectsContent.trim() + '\n');

// 7. Create Cloudflare Pages _headers file for caching & security
const headersContent = `/*
  X-Frame-Options: SAMEORIGIN
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin

/admin/*
  Cache-Control: no-cache, no-store, must-revalidate

/*.xml
  Content-Type: application/xml; charset=utf-8
  Cache-Control: public, max-age=3600, s-maxage=3600

/robots.txt
  Content-Type: text/plain; charset=utf-8
  Cache-Control: public, max-age=86400, s-maxage=86400

/_next/static/*
  Cache-Control: public, max-age=31536000, immutable

/images/*
  Cache-Control: public, max-age=86400, stale-while-revalidate=604800
`;
fs.writeFileSync(path.join(DIST_DIR, '_headers'), headersContent.trim() + '\n');

// 8. Explicitly copy sitemaps and robots.txt into dist
const sitemapFiles = [
  'sitemap.xml',
  'sitemap-index.xml',
  'sitemap_index.xml',
  'sitemap-news.xml',
  'sitemap-articles.xml',
  'sitemap-devices.xml',
  'sitemap-brands.xml',
  'sitemap-categories.xml',
  'sitemap-topics.xml',
  'sitemap-pages.xml',
  'robots.txt',
  'rss.xml',
];

for (const sf of sitemapFiles) {
  const pFile = path.join(PUBLIC_DIR, sf);
  const dFile = path.join(DIST_DIR, sf);
  const rFile = path.join(ROOT, sf);
  if (fs.existsSync(pFile)) {
    fs.copyFileSync(pFile, dFile);
    fs.copyFileSync(pFile, rFile);
  }
}

// 9. Sync full distribution bundle to root for Cloudflare Pages root serving
const distItems = fs.readdirSync(DIST_DIR);
const protectedRootItems = new Set([
  'node_modules',
  'src',
  'prisma',
  'scripts',
  '.git',
  '.github',
  'package.json',
  'package-lock.json',
  'tsconfig.json',
  'tailwind.config.js',
  'next.config.mjs',
  'README.md',
  '.env',
  '.env.example',
  '.gitignore',
  '.next',
]);

for (const item of distItems) {
  if (!protectedRootItems.has(item)) {
    const srcPath = path.join(DIST_DIR, item);
    const destPath = path.join(ROOT, item);
    copyRecursiveSync(srcPath, destPath);
  }
}

console.log('>>> [PREPARE DEPLOY] Bundle ready in "dist" and synced to root with XML Sitemaps and robots.txt!');


