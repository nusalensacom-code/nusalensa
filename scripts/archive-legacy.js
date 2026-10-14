const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const englishSlugs = [
    'iphone-16-pro-max-vs-galaxy-s25-ultra-flagship-comparison',
    'best-smartphones-tested-and-ranked-buying-guide',
    'how-to-migrate-seamlessly-to-international-esim-guide',
    'on-device-ai-silicon-how-npus-are-changing-smartphones',
    'next-gen-silicon-2nm-process-nodes-and-future-smartphones'
  ];

  const updated = await prisma.article.updateMany({
    where: {
      slug: { notIn: englishSlugs },
      status: 'PUBLISHED'
    },
    data: {
      status: 'ARCHIVED'
    }
  });

  console.log('Safely archived legacy Indonesian placeholder records:', updated.count);
  const published = await prisma.article.findMany({ where: { status: 'PUBLISHED' } });
  console.log('Active published English articles count:', published.length);
  published.forEach((p) => console.log(' -', p.title));
}

main().catch(console.error).finally(() => prisma.$disconnect());

