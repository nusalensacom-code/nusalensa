const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function printCats() {
  const cats = await prisma.category.findMany({
    where: { parentId: null },
    include: { children: true }
  });
  console.log(`Total main categories in DB: ${cats.length}`);
  cats.forEach(c => {
    console.log(` - ${c.name} (slug: '${c.slug}')`);
    c.children.forEach(s => {
      console.log(`    * ${s.name} (slug: '${s.slug}')`);
    });
  });
}

printCats().finally(() => prisma.$disconnect());

