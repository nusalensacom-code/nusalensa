const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const articles = await prisma.article.findMany({
    select: { id: true, title: true, featuredImage: true, category: { select: { name: true, slug: true } } }
  });
  console.log(`Total: ${articles.length}`);
  articles.forEach(a => {
    console.log(`ID ${a.id} [${a.category?.name}]: ${a.featuredImage} | "${a.title.substring(0, 45)}"`);
  });
}

main().finally(() => prisma.$disconnect());

