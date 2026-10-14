import { slugify } from '@/lib/utils';
import { siteConfig } from '@/lib/siteConfig';

export interface SeoPackage {
  slug: string;
  seoTitle: string;
  seoDescription: string;
  imageAltText: string;
  imageCaption: string;
  imageSource: string;
  readingTime: number;
  seoScore: number;
}

/**
 * Calculates reading time in minutes based on 200 words per minute
 */
export function calculateReadingTime(text: string): number {
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(Math.ceil(words / 200), 1);
}

/**
 * Calculates real SEO score (0 - 100)
 */
export function evaluateSeoScore(
  title: string,
  seoTitle: string,
  excerpt: string,
  content: string,
  hasImage: boolean,
  hasFaqs: boolean,
  hasSources: boolean
): number {
  let score = 0;

  // Title length optimal (30 - 70 chars)
  if (title.length >= 25 && title.length <= 75) score += 15;
  else if (title.length > 15) score += 8;

  // SEO Title defined
  if (seoTitle.length >= 35 && seoTitle.length <= 70) score += 15;
  else if (seoTitle.length > 20) score += 8;

  // Excerpt / Meta description (100 - 160 chars)
  if (excerpt.length >= 100 && excerpt.length <= 165) score += 15;
  else if (excerpt.length >= 50) score += 8;

  // Content length (> 250 words)
  const words = content.split(/\s+/).filter(Boolean).length;
  if (words >= 250) score += 20;
  else if (words >= 150) score += 12;
  else score += 5;

  // Image availability
  if (hasImage) score += 10;

  // Headings in content
  if (content.includes('## ')) score += 10;

  // FAQ Schema
  if (hasFaqs) score += 10;

  // Source attribution
  if (hasSources) score += 5;

  return Math.min(score, 100);
}

/**
 * Generates SEO metadata package for an AI draft
 */
export function generateSeoPackage(
  title: string,
  excerpt: string,
  content: string,
  categoryName: string,
  sourceName: string,
  imageUrl?: string,
  hasFaqs: boolean = true,
  hasSources: boolean = true
): SeoPackage {
  // Generate clean slug
  const baseSlug = slugify(title);
  const slug = baseSlug.length > 80 ? baseSlug.substring(0, 80).replace(/-[^-]*$/, '') : baseSlug;

  // SEO Title for SERP
  let seoTitle = `${title} | ${siteConfig.name}`;
  if (seoTitle.length > 68) {
    seoTitle = `${title.slice(0, 56).trim()}... | ${siteConfig.name}`;
  }

  // SEO Meta Description
  let seoDescription = excerpt;
  if (seoDescription.length > 158) {
    seoDescription = seoDescription.slice(0, 155).trim() + '...';
  }

  // Image SEO
  const imageAltText = `Hardware photography and analysis for ${title}`;
  const imageCaption = `Editorial reporting and hardware verification for ${title.slice(0, 70)}.`;
  const imageSource = `Source: ${sourceName}`;

  const readingTime = calculateReadingTime(content);
  const seoScore = evaluateSeoScore(
    title,
    seoTitle,
    seoDescription,
    content,
    Boolean(imageUrl),
    hasFaqs,
    hasSources
  );

  return {
    slug,
    seoTitle,
    seoDescription,
    imageAltText,
    imageCaption,
    imageSource,
    readingTime,
    seoScore,
  };
}
