const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixAllCanonicals() {
  console.log('>>> [SEO FIX] Sanitizing canonical URLs for all articles in database...');
  const articles = await prisma.article.findMany({
    include: {
      category: { select: { slug: true } },
    },
  });

  let fixedCount = 0;
  for (const a of articles) {
    const correctCanonical = `https://nusalensa.com/${a.category.slug}/${a.slug}`;
    if (a.canonicalUrl !== correctCanonical) {
      await prisma.article.update({
        where: { id: a.id },
        data: { canonicalUrl: correctCanonical },
      });
      fixedCount++;
    }
  }

  console.log(`>>> [SUCCESS] Updated ${fixedCount} of ${articles.length} articles to self-referencing canonical URLs (https://nusalensa.com/...)`);
}

fixAllCanonicals()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

