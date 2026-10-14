const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const publishedArticles = await prisma.article.count({ where: { status: 'PUBLISHED' } });
  const archivedArticles = await prisma.article.count({ where: { status: 'ARCHIVED' } });
  const brands = await prisma.brand.findMany();
  const devices = await prisma.device.findMany({ include: { brand: true } });

  console.log(`Published Articles: ${publishedArticles}`);
  console.log(`Archived Articles: ${archivedArticles}`);
  console.log(`Brands (${brands.length}):`, brands.map(b => b.name).join(', '));
  console.log(`Devices (${devices.length}):`);
  devices.forEach(d => {
    console.log(` - ${d.name} (${d.brand.name}) [${d.deviceType}] Rating: ${d.rating}`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
