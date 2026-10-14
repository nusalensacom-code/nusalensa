const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const articles = await prisma.article.findMany({
    select: { id: true, slug: true, title: true, featuredImage: true }
  });
  articles.forEach(a => {
    console.log(`ID ${a.id} [${a.slug}] -> ${a.featuredImage}`);
  });
}

main().finally(() => prisma.$disconnect());

