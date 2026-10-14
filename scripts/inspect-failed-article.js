const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const article = await prisma.article.findUnique({
    where: { slug: 'kebon-sirih-usung-festival-jalan-jaksa-dalam-benyamin-s-award-2026' },
  });
  console.log('Article found:', article ? {
    id: article.id,
    title: article.title,
    slug: article.slug,
    publishedAt: article.publishedAt,
    updatedAt: article.updatedAt,
    typeOfPublishedAt: typeof article.publishedAt,
  } : 'NOT FOUND');
}

check()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

