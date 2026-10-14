const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function countWords(str) {
  return str.trim().split(/\s+/).filter(Boolean).length;
}

async function verify() {
  const articles = await prisma.article.findMany({ select: { id: true, title: true, content: true, status: true } });
  console.log(`Total articles in DB: ${articles.length}`);
  let under1200 = 0;
  for (const a of articles) {
    const wc = countWords(a.content);
    if (wc < 1200) {
      console.log(`[BELOW 1200] ID: ${a.id} | Words: ${wc} | Title: ${a.title}`);
      under1200++;
    }
  }
  if (under1200 === 0) {
    console.log(`SEMUA ${articles.length} ARTIKEL MEMENUHI STANDAR >= 1200 KATA! (0 artikel di bawah 1200 kata)`);
  } else {
    console.log(`Ditemukan ${under1200} artikel di bawah 1200 kata.`);
  }
}

verify()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

