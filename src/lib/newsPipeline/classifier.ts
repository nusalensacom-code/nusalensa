import { prisma } from '@/lib/prisma';

export interface ClassificationResult {
  categorySlug: string;
  categoryId: number;
  categoryName: string;
  subcategoryId?: number;
  subcategorySlug?: string;
  suggestedTags: string[];
}

const TECH_TAXONOMY: Record<string, { weight: number; keywords: string[] }> = {
  smartphones: {
    weight: 1.2,
    keywords: [
      'smartphone', 'phone', 'iphone', 'galaxy', 'pixel', 'xiaomi', 'oneplus', 'snapdragon',
      'dimensity', 'oled', 'camera', 'android', 'ios', 'foldable', 'flip', 'telephoto',
      'megapixels', 'battery', 'charging', 'mobile', '5g', 'flagship',
    ],
  },
  technology: {
    weight: 1.0,
    keywords: [
      'technology', 'artificial intelligence', 'ai', 'semiconductor', 'chipset', 'silicon',
      'gpu', 'cpu', 'nvidia', 'amd', 'intel', 'apple silicon', 'quantum', 'cybersecurity',
      'encryption', 'privacy', 'software', 'machine learning', 'cloud', 'robotics',
    ],
  },
  tablets: {
    weight: 1.1,
    keywords: [
      'tablet', 'ipad', 'galaxy tab', 'stylus', 'apple pencil', 'slate', 'surface pro',
      'large screen', 'ipados', 'oled tablet',
    ],
  },
  reviews: {
    weight: 1.1,
    keywords: [
      'review', 'tested', 'hands-on', 'benchmark', 'in-depth test', 'verdict', 'battery test',
      'camera test', 'lab results', 'speed test',
    ],
  },
  'buying-guides': {
    weight: 1.1,
    keywords: [
      'best phone', 'buying guide', 'which to buy', 'vs', 'comparison', 'budget phone',
      'top smartphones', 'best camera', 'flagship comparison', 'buyer guide',
    ],
  },
  'how-to': {
    weight: 1.0,
    keywords: [
      'how to', 'guide', 'tutorial', 'tips', 'tricks', 'step-by-step', 'fix', 'troubleshoot',
      'optimize', 'battery savings', 'settings',
    ],
  },
};

/**
 * Classifies technology news title and summary into appropriate global taxonomy
 */
export async function classifyNews(
  title: string,
  summary: string,
  sourceHint?: string
): Promise<ClassificationResult> {
  const combinedText = `${title} ${summary}`.toLowerCase();

  const scores: Record<string, number> = {};

  for (const [cat, data] of Object.entries(TECH_TAXONOMY)) {
    let matchCount = 0;
    for (const kw of data.keywords) {
      if (combinedText.includes(kw)) {
        matchCount += title.toLowerCase().includes(kw) ? 3 : 1;
      }
    }
    scores[cat] = matchCount * data.weight;
  }

  if (sourceHint && scores[sourceHint] !== undefined) {
    scores[sourceHint] += 2;
  }

  let bestCategory = 'technology';
  let highestScore = 0;

  for (const [cat, score] of Object.entries(scores)) {
    if (score > highestScore) {
      highestScore = score;
      bestCategory = cat;
    }
  }

  // Extract matching tag keywords
  const matchedKeywords: string[] = [];
  const allKeywords = TECH_TAXONOMY[bestCategory]?.keywords || [];
  for (const kw of allKeywords) {
    if (combinedText.includes(kw)) {
      matchedKeywords.push(
        kw.charAt(0).toUpperCase() + kw.slice(1)
      );
    }
  }

  const tags = matchedKeywords.slice(0, 4);
  if (tags.length === 0) {
    tags.push('Smartphones', 'Technology');
  }

  // Fetch or fallback category in DB
  let dbCategory = await prisma.category.findUnique({
    where: { slug: bestCategory },
  });

  if (!dbCategory) {
    dbCategory = await prisma.category.findFirst({
      where: { parentId: null },
    });
  }

  const categoryId = dbCategory?.id || 1;
  const categorySlug = dbCategory?.slug || bestCategory;
  const categoryName = dbCategory?.name || 'Technology';

  return {
    categorySlug,
    categoryId,
    categoryName,
    suggestedTags: tags,
  };
}
