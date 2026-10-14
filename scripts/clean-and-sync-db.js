const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanAndSyncDatabase() {
  console.log('====================================================');
  console.log('   NUSALENSA - DATABASE RESIDUAL CLEANUP & SYNC     ');
  console.log('====================================================');

  // 1. Sync Settings Table
  console.log('>>> 1. Updating Platform Settings...');
  const globalSettings = [
    { key: 'site_name', value: 'NusaLensa' },
    { key: 'site_tagline', value: 'Independent Global Technology News & Smartphone Database' },
    { key: 'site_description', value: 'Independent global technology publication and mobile hardware database. Verified smartphone specifications, benchmark evaluations, side-by-side comparisons, and tech news.' },
    { key: 'contact_email', value: 'editorial@nusalensa.com' },
    { key: 'contact_phone', value: '+1 (800) 555-0199' },
    { key: 'contact_address', value: 'NusaLensa Global Tech Media, 100 Montgomery St, Suite 1800, San Francisco, CA 94104' },
    { key: 'ads_enabled', value: 'true' },
    { key: 'adsense_client_id', value: 'ca-pub-0000000000000000' },
  ];

  for (const s of globalSettings) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: { key: s.key, value: s.value },
    });
  }
  console.log('✓ Platform settings synchronized to NusaLensa Global.');

  // 2. Remove Legacy Indonesian Users
  console.log('>>> 2. Cleaning Legacy Users...');
  const deletedUsers = await prisma.user.deleteMany({
    where: {
      OR: [
        { email: { contains: 'updateyuk.com' } },
        { name: { contains: 'UPDATEYUK' } },
      ],
    },
  });
  console.log(`✓ Removed ${deletedUsers.count} legacy user accounts.`);

  // 3. Ensure Primary Author (Alex Vance) and Primary Category (Technology) Exist
  const alexVance = await prisma.author.findUnique({ where: { slug: 'alex-vance' } });
  const techCategory = await prisma.category.findUnique({ where: { slug: 'technology' } });

  if (!alexVance || !techCategory) {
    throw new Error('Default author Alex Vance or category Technology missing from database.');
  }

  // 4. Reassign archived articles away from legacy authors, categories, and tags
  console.log('>>> 3. Safely reassigning archived articles to primary editorial staff...');
  const archivedArticles = await prisma.article.findMany({
    where: { status: 'ARCHIVED' },
    select: { id: true },
  });

  for (const art of archivedArticles) {
    await prisma.article.update({
      where: { id: art.id },
      data: {
        authorId: alexVance.id,
        editorId: null,
        categoryId: techCategory.id,
        subcategoryId: null,
        primaryTopicId: null,
        tags: { set: [] },
      },
    });
  }
  console.log(`✓ Reassigned ${archivedArticles.length} archived records.`);

  // 5. Remove Legacy Indonesian Authors
  console.log('>>> 4. Cleaning Legacy Authors...');
  const deletedAuthors = await prisma.author.deleteMany({
    where: {
      email: { contains: 'updateyuk.com' },
    },
  });
  console.log(`✓ Removed ${deletedAuthors.count} legacy author profiles.`);

  // 6. Clean Legacy Indonesian Curated News Queue Items
  console.log('>>> 5. Cleaning Legacy Curated News Queue...');
  const deletedQueue = await prisma.curatedNewsQueue.deleteMany({
    where: {
      OR: [
        { sourceName: { contains: 'ANTARA' } },
        { sourceName: { contains: 'Detik' } },
        { sourceName: { contains: 'CNN Indonesia' } },
        { sourceName: { contains: 'Kompas' } },
        { sourceName: { contains: 'Tempo' } },
        { sourceName: { contains: 'BMKG' } },
      ],
    },
  });
  console.log(`✓ Removed ${deletedQueue.count} legacy queue items.`);

  // 7. Clean and Seed News Sources
  console.log('>>> 6. Updating News Sources...');
  const deletedSources = await prisma.newsSource.deleteMany({
    where: {
      OR: [
        { url: { contains: 'detik.com' } },
        { url: { contains: 'cnnindonesia.com' } },
        { url: { contains: 'kompas.com' } },
        { url: { contains: 'tempo.co' } },
        { url: { contains: 'antaranews.com' } },
        { url: { contains: 'bmkg.go.id' } },
      ],
    },
  });
  console.log(`✓ Removed ${deletedSources.count} legacy news sources.`);

  const internationalSources = [
    {
      name: 'The Verge - Tech & Mobile',
      url: 'https://www.theverge.com/rss/index.xml',
      categoryHint: 'smartphones',
    },
    {
      name: 'Ars Technica - Technology Lab',
      url: 'https://feeds.arstechnica.com/arstechnica/index',
      categoryHint: 'technology',
    },
    {
      name: '9to5Google - Pixel & Android',
      url: 'https://9to5google.com/feed/',
      categoryHint: 'smartphones',
    },
    {
      name: 'Android Authority - Hardware Reviews',
      url: 'https://www.androidauthority.com/feed/',
      categoryHint: 'smartphones',
    },
    {
      name: 'MacRumors - Apple & iOS',
      url: 'https://feeds.macrumors.com/MacRumors-All',
      categoryHint: 'smartphones',
    },
    {
      name: 'GSMArena - Smartphone News',
      url: 'https://www.gsmarena.com/rss-news-reviews.php3',
      categoryHint: 'smartphones',
    },
    {
      name: 'TechCrunch - Hardware & Devices',
      url: 'https://techcrunch.com/category/hardware/feed/',
      categoryHint: 'technology',
    },
    {
      name: '9to5Mac - Apple Intelligence & Devices',
      url: 'https://9to5mac.com/feed/',
      categoryHint: 'smartphones',
    },
    {
      name: 'Apple Newsroom - Official Releases',
      url: 'https://www.apple.com/newsroom/rss-feed.rss',
      categoryHint: 'smartphones',
    },
    {
      name: 'Google The Keyword - Official Blog',
      url: 'https://blog.google/rss/',
      categoryHint: 'technology',
    },
  ];

  for (const src of internationalSources) {
    await prisma.newsSource.upsert({
      where: { url: src.url },
      update: { name: src.name, categoryHint: src.categoryHint, isActive: true },
      create: { name: src.name, url: src.url, categoryHint: src.categoryHint, isActive: true },
    });
  }
  console.log(`✓ Registered ${internationalSources.length} international news sources.`);

  // 8. Clean Legacy Tags and Seed Global Tech Tags
  console.log('>>> 7. Updating Taxonomy Tags...');
  const indonesianTagSlugs = [
    'timnas-indonesia', 'ikn-nusantara', 'mobil-listrik', 'kecerdasan-buatan',
    'keuangan-keluarga', 'tips-hemat', 'kesehatan-mental', 'wisata-alam',
    'kuliner-tradisional', 'pendidikan-digital', 'resep-masakan', 'itinerary-hemat',
  ];
  await prisma.tag.deleteMany({
    where: {
      OR: [
        { slug: { in: indonesianTagSlugs } },
        { articles: { none: {} } },
      ],
    },
  });

  const techTags = [
    { name: 'Smartphones', slug: 'smartphones', description: 'Flagship and budget smartphone news, lab tests, and specifications.' },
    { name: 'Apple', slug: 'apple', description: 'iPhone, iPad, Apple Silicon, and iOS software updates.' },
    { name: 'Samsung', slug: 'samsung', description: 'Galaxy S-series, Galaxy Z Fold, One UI, and ISOCELL camera sensors.' },
    { name: 'Google Pixel', slug: 'google-pixel', description: 'Google Pixel hardware, Tensor processors, and Android updates.' },
    { name: 'Qualcomm Snapdragon', slug: 'snapdragon', description: 'Snapdragon 8 Elite processors, Adreno GPUs, and modem technology.' },
    { name: 'AI Silicon', slug: 'ai-silicon', description: 'Neural Processing Units (NPUs), on-device LLMs, and computational photography.' },
    { name: 'Displays & OLED', slug: 'oled-displays', description: 'Tandem OLED, LTPO high refresh rate, and anti-reflective display panels.' },
    { name: 'Camera Systems', slug: 'camera-tech', description: 'Periscope telephotos, 1-inch sensors, variable apertures, and computational optics.' },
    { name: 'Battery & Charging', slug: 'battery-charging', description: 'Solid-state batteries, silicon-carbon anodes, and high-wattage fast charging.' },
    { name: 'eSIM & 5G Networks', slug: 'esim-5g', description: 'eSIM profiles, mmWave 5G, satellite connectivity, and carrier compatibility.' },
  ];

  for (const t of techTags) {
    await prisma.tag.upsert({
      where: { slug: t.slug },
      update: { name: t.name, description: t.description },
      create: { name: t.name, slug: t.slug, description: t.description },
    });
  }
  console.log(`✓ Seeded ${techTags.length} global technology tags.`);

  // 9. Clean Legacy Indonesian Categories
  console.log('>>> 8. Cleaning Legacy Categories...');
  const officialCategorySlugs = [
    'phones', 'flagships', 'budget-phones', 'foldables',
    'tablets', 'pro-tablets', 'compact-slates',
    'technology', 'ai-silicon', 'operating-systems', 'cybersecurity',
    'reviews', 'phone-reviews', 'long-term-tests',
    'buying-guides', 'camera-phones', 'best-under-800',
    'how-to', 'android-guides', 'ios-guides',
    'news', 'product-launches', 'industry-standards',
  ];

  // Delete legacy subcategories first (where no articles remain)
  const deletedSubcategories = await prisma.category.deleteMany({
    where: {
      slug: { notIn: officialCategorySlugs },
      parentId: { not: null },
      articles: { none: {} },
    },
  });
  console.log(`✓ Removed ${deletedSubcategories.count} legacy subcategories.`);

  // Delete legacy parent categories
  const deletedCategories = await prisma.category.deleteMany({
    where: {
      slug: { notIn: officialCategorySlugs },
      articles: { none: {} },
    },
  });
  console.log(`✓ Removed ${deletedCategories.count} legacy parent categories.`);

  console.log('=== DATABASE CLEANUP COMPLETED SUCCESSFULLY ===');
}

cleanAndSyncDatabase()
  .catch((e) => {
    console.error('Error during cleanup:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

