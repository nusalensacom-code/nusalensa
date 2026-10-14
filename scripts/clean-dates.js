const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const SEED_FILE = path.join(__dirname, '..', 'prisma', 'seed-articles.json');

async function clean() {
  // 1. Clean JSON file
  if (fs.existsSync(SEED_FILE)) {
    const raw = fs.readFileSync(SEED_FILE, 'utf8');
    const articles = JSON.parse(raw);
    for (const a of articles) {
      if (a.sources) {
        try {
          const s = JSON.parse(a.sources);
          if (Array.isArray(s)) {
            for (const item of s) {
              if (item.accessDate && isNaN(new Date(item.accessDate).getTime())) {
                item.accessDate = new Date().toISOString().split('T')[0];
              }
            }
            a.sources = JSON.stringify(s);
          }
        } catch (e) {}
      }
    }
    fs.writeFileSync(SEED_FILE, JSON.stringify(articles, null, 2), 'utf8');
    console.log(`Cleaned seed-articles.json (${articles.length} items).`);
  }

  // 2. Clean DB articles
  const allArticles = await prisma.article.findMany();
  let dbCount = 0;
  for (const art of allArticles) {
    if (art.sources) {
      try {
        const s = JSON.parse(art.sources);
        let modified = false;
        if (Array.isArray(s)) {
          for (const item of s) {
            if (item.accessDate && isNaN(new Date(item.accessDate).getTime())) {
              item.accessDate = new Date().toISOString().split('T')[0];
              modified = true;
            }
          }
        }
        if (modified) {
          await prisma.article.update({
            where: { id: art.id },
            data: { sources: JSON.stringify(s) },
          });
          dbCount++;
        }
      } catch (e) {}
    }
  }
  console.log(`Cleaned ${dbCount} articles in database.`);
}

clean()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

