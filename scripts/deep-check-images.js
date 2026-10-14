const https = require('https');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUrl(url) {
  return new Promise((resolve) => {
    try {
      const u = new URL(url);
      const req = https.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
          'Referer': 'http://localhost:3000/'
        }
      }, (res) => {
        let len = 0;
        res.on('data', chunk => len += chunk.length);
        res.on('end', () => {
          resolve({ status: res.statusCode, contentType: res.headers['content-type'], length: len });
        });
      });
      req.on('error', (err) => resolve({ status: 'ERR', error: err.message }));
      req.setTimeout(8000, () => {
        req.destroy();
        resolve({ status: 'TIMEOUT' });
      });
    } catch (e) {
      resolve({ status: 'BAD_URL', error: e.message });
    }
  });
}

async function main() {
  const articles = await prisma.article.findMany({
    select: { id: true, title: true, featuredImage: true, slug: true }
  });

  console.log(`Checking ${articles.length} article images with browser headers & referer...`);
  for (const a of articles) {
    const res = await checkUrl(a.featuredImage);
    const ok = res.status === 200 && res.length > 5000;
    console.log(`[${ok ? 'OK' : 'FAIL'}] Article ${a.id} (${res.status}, ${res.length} bytes, ${res.contentType}): ${a.featuredImage}`);
    if (!ok) {
      console.log(`   -> Title: ${a.title}`);
    }
  }

  const authors = await prisma.author.findMany({ select: { id: true, name: true, avatar: true } });
  console.log(`\nChecking ${authors.length} author avatars...`);
  for (const auth of authors) {
    if (auth.avatar) {
      const res = await checkUrl(auth.avatar);
      const ok = res.status === 200;
      console.log(`[${ok ? 'OK' : 'FAIL'}] Author ${auth.name} (${res.status}): ${auth.avatar}`);
    }
  }
}

main().finally(() => prisma.$disconnect());

