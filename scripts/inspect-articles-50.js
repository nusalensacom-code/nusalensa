const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function inspect() {
  const articles = await prisma.article.findMany({
    where: { id: { gte: 50 } },
    include: { author: true, category: true },
  });

  console.log(`Found ${articles.length} articles with ID >= 50.`);
  for (const a of articles) {
    console.log(`ID: ${a.id} | Slug: ${a.slug}`);
    console.log(`  publishedAt:`, a.publishedAt, typeof a.publishedAt);
    console.log(`  updatedAt:`, a.updatedAt, typeof a.updatedAt);
    try {
      new Date(a.publishedAt).toISOString();
    } catch (e) {
      console.log(`  ERROR publishedAt.toISOString():`, e.message);
    }
    try {
      new Date(a.updatedAt).toISOString();
    } catch (e) {
      console.log(`  ERROR updatedAt.toISOString():`, e.message);
    }
  }
}

inspect()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

