const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const articles = await prisma.article.findMany({ select: { id: true, title: true, publishedAt: true, slug: true } });
  let invalidCount = 0;
  for (const a of articles) {
    const d = new Date(a.publishedAt);
    if (!a.publishedAt || isNaN(d.getTime())) {
      console.log('INVALID DATE in article:', a.id, a.slug, 'Value:', a.publishedAt);
      invalidCount++;
    }
  }
  console.log(`Checked ${articles.length} articles, found ${invalidCount} invalid dates.`);
}

check()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

