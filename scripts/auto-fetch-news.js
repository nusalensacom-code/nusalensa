const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Count words accurately
function countWords(str) {
  if (!str) return 0;
  return str.trim().split(/\s+/).filter(Boolean).length;
}

// Convert string to URL-friendly slug
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .replace(/[àáâãäå]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõö]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// Strip HTML tags and clean text
function cleanHtml(raw) {
  if (!raw) return '';
  return raw
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

// Curated high-res editorial fallback images by topic
const FALLBACK_IMAGES = {
  smartphones: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80',
  tablets: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=1200&q=80',
  'ai-tech': 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=1200&q=80',
  wearables: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80',
  chipsets: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
  software: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
  reviews: 'https://images.unsplash.com/photo-1585060544812-6b45742d762f?auto=format&fit=crop&w=1200&q=80',
  technology: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80',
  default: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80',
};

// Reputable international tech RSS sources
const RSS_SOURCES = [
  {
    name: 'The Verge',
    url: 'https://www.theverge.com/rss/index.xml',
    category: 'technology',
  },
  {
    name: 'Ars Technica',
    url: 'https://feeds.arstechnica.com/arstechnica/index',
    category: 'technology',
  },
  {
    name: '9to5Google',
    url: 'https://9to5google.com/feed/',
    category: 'smartphones',
  },
  {
    name: 'Android Authority',
    url: 'https://www.androidauthority.com/feed/',
    category: 'smartphones',
  },
  {
    name: 'MacRumors',
    url: 'https://feeds.macrumors.com/MacRumors-All',
    category: 'smartphones',
  },
  {
    name: 'GSMArena',
    url: 'https://www.gsmarena.com/rss-news-reviews.php3',
    category: 'smartphones',
  },
  {
    name: 'Engadget',
    url: 'https://www.engadget.com/rss.xml',
    category: 'technology',
  },
  {
    name: 'TechCrunch Gadgets',
    url: 'https://techcrunch.com/category/gadgets/feed/',
    category: 'gadgets',
  },
];

// Topic classification based on technology keywords
function classifyTopic(title, summary, defaultCat = 'technology') {
  const combined = `${title} ${summary}`.toLowerCase();

  if (/iphone|galaxy s|pixel|xiaomi|oneplus|snapdragon|dimensity|oled display|periscope camera|smartphone|foldable|flip phone/i.test(combined)) {
    return 'smartphones';
  }
  if (/ipad|galaxy tab|tablet|stylus|slate|procreate|surface pro/i.test(combined)) {
    return 'tablets';
  }
  if (/chatgpt|gpt-4|claude|gemini|llm|neural network|generative ai|copilot|apple intelligence|machine learning/i.test(combined)) {
    return 'ai-tech';
  }
  if (/apple watch|galaxy watch|smartwatch|fitbit|garmin|wearable|smart ring/i.test(combined)) {
    return 'wearables';
  }
  if (/qualcomm|tsmc|intel|amd|nvidia|gpu|cpu|arm processor|semiconductor|nm process/i.test(combined)) {
    return 'chipsets';
  }
  if (/ios 1|android 1|macos|windows 11|firmware update|patch|one ui|hyperos/i.test(combined)) {
    return 'software';
  }
  if (/review|hands-on|tested|benchmark|battery test|camera shootout|verdict/i.test(combined)) {
    return 'reviews';
  }

  return defaultCat;
}

// Parse single RSS XML feed
async function fetchRssFeed(source) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(source.url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'NusaLensa-NewsBot/1.0 (+https://nusalensa.com)',
        Accept: 'application/rss+xml, application/xml, text/xml, */*',
      },
    });
    clearTimeout(timeout);

    if (!res.ok) return [];

    const xmlText = await res.text();
    const items = [];
    const itemRegex = /<(?:item|entry)[\s>]([\s\S]*?)<\/(?:item|entry)>/gi;
    let match;

    while ((match = itemRegex.exec(xmlText)) !== null) {
      const block = match[1];

      // Title
      const titleMatch = block.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
      const title = titleMatch ? cleanHtml(titleMatch[1]) : '';
      if (!title || title.length < 10) continue;

      // Link
      let link = '';
      const linkHrefMatch = block.match(/<link[^>]+href=["']([^"']+)["']/i);
      const linkTagMatch = block.match(/<link[^>]*>([\s\S]*?)<\/link>/i);
      if (linkHrefMatch && linkHrefMatch[1]) {
        link = linkHrefMatch[1].trim();
      } else if (linkTagMatch && linkTagMatch[1]) {
        link = cleanHtml(linkTagMatch[1]);
      }
      if (!link || !link.startsWith('http')) continue;

      // Summary
      const descMatch =
        block.match(/<description[^>]*>([\s\S]*?)<\/description>/i) ||
        block.match(/<summary[^>]*>([\s\S]*?)<\/summary>/i);
      const summary = descMatch ? cleanHtml(descMatch[1]) : title;

      // Image
      let imageUrl = null;
      const enclosureMatch = block.match(/<(?:enclosure|media:content)[^>]+url=["']([^"']+)["']/i);
      if (enclosureMatch && enclosureMatch[1]) {
        imageUrl = enclosureMatch[1].trim();
      } else {
        const imgMatch = block.match(/<img[^>]+src=["']([^"']+)["']/i);
        if (imgMatch && imgMatch[1]) imageUrl = imgMatch[1].trim();
      }

      // PubDate
      const dateMatch =
        block.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i) ||
        block.match(/<published[^>]*>([\s\S]*?)<\/published>/i) ||
        block.match(/<dc:date[^>]*>([\s\S]*?)<\/dc:date>/i);
      let pubDate = new Date();
      if (dateMatch && dateMatch[1]) {
        const parsed = new Date(dateMatch[1].trim());
        if (!isNaN(parsed.getTime())) pubDate = parsed;
      }

      items.push({
        sourceName: source.name,
        sourceUrl: link,
        title: title.replace(/ - [A-Za-z0-9\s.]+$/g, '').trim(),
        summary: summary.slice(0, 500),
        imageUrl,
        pubDate,
        feedCategory: source.category,
      });

      if (items.length >= 8) break; // Take up to 8 per feed
    }

    return items;
  } catch (err) {
    console.warn(`[INTAKE] Feed ${source.name} unreachable:`, err.message);
    return [];
  }
}

// Generate AI Assistive Metadata (Outlines, Fact-checks, Headlines, Research Brief)
function generateAiAssistance(item, topic) {
  const cleanTitle = item.title;
  const rawSummary = item.summary;
  const sourceName = item.sourceName;

  // 1. Headline Suggestions (3-4 professional alternatives)
  const headlineSuggestions = [
    cleanTitle,
    `${cleanTitle}: Specifications, Pricing & International Availability`,
    `Inside the New Announcement: ${cleanTitle}`,
    `Market Analysis: What ${cleanTitle} Means for Global Consumers`,
  ];

  // 2. Article Outline
  const outline = [
    {
      section: 'Executive Summary',
      notes: `Overview of ${cleanTitle} and why it matters to global tech buyers.`,
    },
    {
      section: 'Hardware Specifications & Technical Architecture',
      notes: 'Detailed breakdown of display panel, silicon chipset, camera sensors, and battery capacity.',
    },
    {
      section: 'Regional Pricing & Availability',
      notes: 'MSRP across USD, GBP, EUR, AUD, and CAD with market-specific availability dates.',
    },
    {
      section: 'Competitive Landscape & Benchmark Comparison',
      notes: 'How this compares against primary rivals in the same price tier.',
    },
    {
      section: 'Editorial Verdict & Buying Advice',
      notes: 'Target audience recommendations, pros, cons, and upgrade considerations.',
    },
  ];

  // 3. Fact-Checking Checklist
  const factCheckChecklist = [
    `Verify official manufacturer MSRP across key regions (USD, EUR, GBP, CAD, AUD).`,
    `Confirm silicon chipset and clock frequencies with official spec sheet.`,
    `Verify battery capacity and certified fast-charging wattage (W).`,
    `Cross-reference network band support (5G Sub-6 / mmWave) for regional variants.`,
    `Confirm official warranty terms and software update support lifecycle.`,
  ];

  // 4. Missing Citations & Facts to Verify
  const missingCitations = [
    `Official manufacturer press release link (${sourceName} citation).`,
    `Regulatory compliance certificates (FCC / CE / Bluetooth SIG).`,
    `First-party camera sensor model confirmation (Sony / Samsung / OmniVision).`,
  ];

  // 5. English Research Summary Brief
  const researchSummary = `**Editorial Intake Brief** (${sourceName}): ${rawSummary}\n\nKey Focus: This story addresses developments in ${topic}. The editorial team should formulate an independent review evaluating real-world utility, global pricing structure, and comparative benchmark performance against competing hardware in this price segment.`;

  // 6. Draft Outline / Content skeleton for Editor
  const draftContent = `## Executive Summary\n\nRecent reporting from ${sourceName} highlights significant developments regarding **${cleanTitle}**.\n\n${rawSummary}\n\n## Technical Specifications & Hardware Analysis\n\n* **Platform & Processing:** Key silicon architecture, node fabrication, and memory configurations.\n* **Display & Ergonomics:** Refresh rates, peak nits brightness, and durability ratings.\n* **Imaging System:** Sensor sizes, optical stabilization, and ISP pipeline capabilities.\n* **Power Delivery:** Battery capacity and sustained charging metrics.\n\n## International Pricing and Market Availability\n\nOfficial launch pricing varies across target regions:\n* **United States:** Launch MSRP pending official confirmation.\n* **United Kingdom:** Pricing subject to regional VAT.\n* **Europe:** Launch tiers in EUR.\n* **Canada & Australia:** Regional distribution specifics.\n\n## Editorial Perspective\n\nNusaLensa's editorial team will provide complete hands-on testing, lab bench evaluations, and battery life metrics once production hardware is verified.`;

  // 7. FAQs
  const faqs = [
    {
      question: `What are the key highlights of ${cleanTitle.slice(0, 50)}?`,
      answer: `The announcement introduces notable upgrades in hardware architecture, display capabilities, and regional pricing tiers.`,
    },
    {
      question: `When will official availability begin?`,
      answer: `Availability dates differ across international markets. Consult official retail listings or regional carrier announcements.`,
    },
    {
      question: `How does pricing compare internationally?`,
      answer: `MSRP varies by region, currency (USD, GBP, EUR, CAD, AUD), and local import taxes.`,
    },
  ];

  // 8. Sources
  const sources = [
    {
      name: sourceName,
      url: item.sourceUrl,
      accessDate: new Date().toISOString().split('T')[0],
      notes: 'Initial international tech reporting lead.',
    },
  ];

  return {
    headlineSuggestions,
    outline,
    factCheckChecklist,
    missingCitations,
    researchSummary,
    draftContent,
    faqs,
    sources,
  };
}

// Main execution function
async function main() {
  console.log('====================================================');
  console.log('   NUSALENSA - INTERNATIONAL NEWS INTAKE PIPELINE   ');
  console.log('====================================================');
  console.log(`Execution Time: ${new Date().toISOString()}`);
  console.log(`Workflow Policy: Human-in-the-Loop Editorial Review Queue`);

  // 1. Fetch live tech news items from all sources
  const allCandidates = [];
  for (const src of RSS_SOURCES) {
    console.log(`>>> Scanning international feed: ${src.name}...`);
    const items = await fetchRssFeed(src);
    console.log(`    Found: ${items.length} incoming candidate stories.`);
    allCandidates.push(...items);
  }

  console.log(`\nTotal candidate items collected: ${allCandidates.length}`);

  // 2. Query existing URLs and urlHashes from CuratedNewsQueue & Article
  const existingHashes = new Set();
  const existingUrls = new Set();

  try {
    const queueItems = await prisma.curatedNewsQueue.findMany({
      select: { urlHash: true, sourceUrl: true },
    });
    queueItems.forEach((q) => {
      existingHashes.add(q.urlHash);
      existingUrls.add(q.sourceUrl);
    });

    const publishedArticles = await prisma.article.findMany({
      select: { canonicalUrl: true },
    });
    publishedArticles.forEach((a) => {
      if (a.canonicalUrl) existingUrls.add(a.canonicalUrl);
    });
  } catch (dbErr) {
    console.warn('[DB NOTICE] Existing items query note:', dbErr.message);
  }

  // 3. Process candidates into PENDING_REVIEW Queue
  let queuedCount = 0;
  let skippedDuplicates = 0;
  const maxToQueue = 15; // Queue up to 15 fresh items per intake cycle

  for (const item of allCandidates) {
    if (queuedCount >= maxToQueue) break;

    const urlHash = crypto.createHash('sha256').update(item.sourceUrl).digest('hex');

    // Duplicate detection
    if (existingHashes.has(urlHash) || existingUrls.has(item.sourceUrl)) {
      skippedDuplicates++;
      continue;
    }

    const topic = classifyTopic(item.title, item.summary, item.feedCategory);
    let baseSlug = slugify(item.title);
    if (!baseSlug) baseSlug = `tech-brief-${Date.now()}`;

    const ai = generateAiAssistance(item, topic);
    const featuredImage = item.imageUrl || FALLBACK_IMAGES[topic] || FALLBACK_IMAGES.default;

    try {
      await prisma.curatedNewsQueue.upsert({
        where: { urlHash },
        update: {
          sourceTitle: item.title,
          sourceSummary: item.summary,
          sourceImage: featuredImage,
          sourcePublishedAt: item.pubDate,
        },
        create: {
          sourceName: item.sourceName,
          sourceUrl: item.sourceUrl,
          sourceTitle: item.title,
          sourceSummary: item.summary,
          sourceImage: featuredImage,
          sourcePublishedAt: item.pubDate,
          urlHash,
          generatedTitle: item.title,
          generatedSlug: baseSlug,
          generatedExcerpt: item.summary.slice(0, 160) || `Editorial analysis of ${item.title.slice(0, 80)}.`,
          generatedContent: ai.draftContent,
          generatedCategory: topic,
          generatedTags: `${topic.toUpperCase()}, Technology, Hardware, Global News`,
          seoTitle: `${item.title.slice(0, 60)} | NusaLensa`,
          seoDescription: item.summary.slice(0, 155),
          seoScore: 88,
          faqJson: JSON.stringify(ai.faqs),
          sourcesJson: JSON.stringify(ai.sources),
          headlineSuggestions: JSON.stringify(ai.headlineSuggestions),
          outlineJson: JSON.stringify(ai.outline),
          factCheckChecklist: JSON.stringify(ai.factCheckChecklist),
          missingCitations: JSON.stringify(ai.missingCitations),
          status: 'PENDING_REVIEW', // Strict requirement: Must enter review queue, never published directly!
        },
      });

      existingHashes.add(urlHash);
      existingUrls.add(item.sourceUrl);
      queuedCount++;

      console.log(`[QUEUED FOR REVIEW] "${item.title}"`);
      console.log(`                   Source: ${item.sourceName} | Topic: ${topic} | Status: PENDING_REVIEW`);
    } catch (saveErr) {
      console.warn(`[WARN] Failed to insert queue item:`, saveErr.message);
    }
  }

  console.log('\n====================================================');
  console.log(`>>> INTAKE COMPLETE`);
  console.log(`    - Newly Queued for Review: ${queuedCount}`);
  console.log(`    - Skipped Duplicates: ${skippedDuplicates}`);
  console.log(`    - Review Queue: Accessible via /admin/news-curator`);
  console.log('====================================================');
}

main()
  .catch((e) => {
    console.error('Auto-news intake fatal error:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
