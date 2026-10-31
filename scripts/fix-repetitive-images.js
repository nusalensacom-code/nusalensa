/**
 * NusaLensa - Fix Repetitive & Hardcoded Article Images
 * 
 * Replaces the repetitive smartphone stock photo (photo-1511707171634-5f897ff02aa9)
 * and assigns intelligent, contextual, diverse editorial imagery based on article title,
 * brand keywords, and category taxonomy.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const REPETITIVE_IMAGE_ID = 'photo-1511707171634-5f897ff02aa9';

const BRAND_IMAGE_POOLS = {
  apple: [
    'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1616348436168-de43ad0db179?auto=format&fit=crop&w=1200&q=80',
  ],
  samsung: [
    'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1585060544812-6b45742d762f?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1567581935884-3349723552ca?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=1200&q=80',
  ],
  google: [
    'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?auto=format&fit=crop&w=1200&q=80',
  ],
  xiaomi: [
    'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=1200&q=80',
  ],
  ai: [
    'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1200&q=80',
  ],
  software: [
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1530319067432-f2a729c03db5?auto=format&fit=crop&w=1200&q=80',
  ],
  chipset: [
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&w=1200&q=80',
  ],
  tablets: [
    'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1561154464-82e9adf32764?auto=format&fit=crop&w=1200&q=80',
  ],
  smartphones: [
    'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1567581935884-3349723552ca?auto=format&fit=crop&w=1200&q=80',
  ],
  general: [
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=1200&q=80',
  ]
};

function hashString(str) {
  let hash = 0;
  const clean = (str || '').toLowerCase().trim();
  for (let i = 0; i < clean.length; i++) {
    hash = (hash << 5) - hash + clean.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function matchImageForArticle(title, slug, categorySlug) {
  const text = `${title} ${slug}`.toLowerCase();

  let poolKey = 'smartphones';
  if (/iphone|apple|ios|ipad|macbook|airpods/i.test(text)) {
    poolKey = 'apple';
  } else if (/galaxy|samsung|one ui|exynos/i.test(text)) {
    poolKey = 'samsung';
  } else if (/pixel|google|android 1[5-7]|tensor/i.test(text)) {
    poolKey = 'google';
  } else if (/xiaomi|redmi|poco|hyperos/i.test(text)) {
    poolKey = 'xiaomi';
  } else if (/ai|intelligence|chatgpt|openai|gemini|copilot|deepseek/i.test(text)) {
    poolKey = 'ai';
  } else if (/whatsapp|update|app|software|features|guest calling|firmware/i.test(text)) {
    poolKey = 'software';
  } else if (/chip|snapdragon|mediatek|processor|dimensity|silicon|bionic/i.test(text)) {
    poolKey = 'chipset';
  } else if (/tablet|ipad|pad/i.test(text)) {
    poolKey = 'tablets';
  } else if (/smartphones|phone|mobile|flagship/i.test(text)) {
    poolKey = 'smartphones';
  } else {
    poolKey = 'general';
  }

  const pool = BRAND_IMAGE_POOLS[poolKey] || BRAND_IMAGE_POOLS.smartphones;
  const idx = hashString(title + (slug || '')) % pool.length;
  return pool[idx];
}

async function main() {
  console.log('Searching for articles with repetitive image:', REPETITIVE_IMAGE_ID);

  const articles = await prisma.article.findMany({
    where: {
      featuredImage: { contains: REPETITIVE_IMAGE_ID }
    },
    select: {
      id: true,
      title: true,
      slug: true,
      featuredImage: true,
      category: { select: { slug: true } }
    }
  });

  console.log(`Found ${articles.length} articles to update.`);

  let updated = 0;
  for (const art of articles) {
    const newImage = matchImageForArticle(art.title, art.slug, art.category?.slug);
    await prisma.article.update({
      where: { id: art.id },
      data: { featuredImage: newImage }
    });
    updated++;
    console.log(`[${updated}/${articles.length}] ID ${art.id}: "${art.title.slice(0, 40)}..." -> ${newImage.slice(0, 50)}...`);
  }

  console.log(`\nSuccessfully updated ${updated} articles!`);
}

main()
  .catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
