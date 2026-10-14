const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const categories = await prisma.category.findMany();
  const catSlugs = new Set(categories.map(c => c.slug));
  const authors = await prisma.author.findMany();
  const authSlugs = new Set(authors.map(a => a.slug));

  const content = fs.readFileSync('prisma/seed.js', 'utf8');
  const catMatches = [...content.matchAll(/categorySlug:\s*["']([^"']+)["']/g)].map(m => m[1]);
  const authMatches = [...content.matchAll(/authorSlug:\s*["']([^"']+)["']/g)].map(m => m[1]);
  const titleMatches = [...content.matchAll(/title:\s*["']([^"']+)["']/g)].map(m => m[1]);

  console.log(`Found ${catMatches.length} articles in seed.js`);
  for (let i = 0; i < catMatches.length; i++) {
    const cSlug = catMatches[i];
    const aSlug = authMatches[i];
    const title = titleMatches[i];
    const hasCat = catSlugs.has(cSlug);
    const hasAuth = authSlugs.has(aSlug);
    if (!hasCat || !hasAuth) {
      console.log(`[SKIPPED #${i+1}] "${title?.substring(0, 30)}": cat '${cSlug}' (exists: ${hasCat}), auth '${aSlug}' (exists: ${hasAuth})`);
    } else {
      console.log(`[OK #${i+1}] "${title?.substring(0, 30)}": cat '${cSlug}', auth '${aSlug}'`);
    }
  }
}

check().finally(() => prisma.$disconnect());

