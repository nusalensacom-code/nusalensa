/**
 * Server-side Word Count Validator for NusaLensa AI Article Generator.
 * Accurately measures English words in the article body while strictly excluding
 * external metadata, bibliography blocks, editorial notes, and formatting markup.
 */

export interface WordCountAnalysis {
  totalWords: number;
  sections: Array<{
    heading: string;
    wordCount: number;
    isUnderdeveloped: boolean;
  }>;
  meetsMinimum: boolean;
  targetWordCount: number;
  underdevelopedSections: string[];
}

/**
 * Cleanly extracts printable text from markdown without symbols, asterisks, brackets, or image links.
 */
export function cleanMarkdownForWordCount(markdown: string): string {
  if (!markdown) return '';

  return markdown
    // Remove markdown image tags: ![alt](url)
    .replace(/!\[.*?\]\(.*?\)/g, '')
    // Replace markdown links with just the anchor text: [anchor](url) -> anchor
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    // Remove raw URLs
    .replace(/https?:\/\/\S+/g, '')
    // Remove HTML tags
    .replace(/<[^>]+>/g, ' ')
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, '')
    // Remove inline code
    .replace(/`([^`]+)`/g, '$1')
    // Remove heading markers (###, ##, #)
    .replace(/^[#\s]+/gm, '')
    // Remove blockquote markers (>)
    .replace(/^>\s+/gm, '')
    // Remove bullet and numbered list markers
    .replace(/^[\s*-+]+(?:\d+\.)?\s+/gm, '')
    // Remove bold and italics formatting (**word**, *word*, __word__, _word_)
    .replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, '$1')
    // Remove table formatting pipes
    .replace(/\|/g, ' ')
    // Remove horizontal rules
    .replace(/^[-*_]{3,}\s*$/gm, '')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Counts words accurately according to standard US English word boundaries.
 */
export function countWords(text: string): number {
  if (!text) return 0;
  const cleaned = cleanMarkdownForWordCount(text);
  if (!cleaned) return 0;
  const words = cleaned.split(/\s+/).filter(Boolean);
  return words.length;
}

/**
 * Splits an article body into H2/H3 sections and evaluates word count distribution.
 */
export function analyzeArticleSections(markdown: string, targetTotal = 1500): WordCountAnalysis {
  const totalWords = countWords(markdown);
  const sections: Array<{ heading: string; wordCount: number; isUnderdeveloped: boolean }> = [];
  const underdevelopedSections: string[] = [];

  // Match H2 and H3 sections
  const sectionRegex = /(?:^|\n)(##[#]?\s+[^\n]+)([\s\S]*?)(?=(?:\n##[#]?\s+[^\n]+)|$)/g;
  let match: RegExpExecArray | null;

  while ((match = sectionRegex.exec(markdown)) !== null) {
    const headingLine = match[1].trim();
    const headingTitle = headingLine.replace(/^#+\s*/, '').trim();
    const sectionBody = match[2].trim();

    // Word count of this section (including its heading)
    const sectionWords = countWords(`${headingTitle}\n${sectionBody}`);

    // If section has fewer than 110 words, mark as underdeveloped
    const isUnderdeveloped = sectionWords < 110;
    if (isUnderdeveloped) {
      underdevelopedSections.push(headingTitle);
    }

    sections.push({
      heading: headingTitle,
      wordCount: sectionWords,
      isUnderdeveloped,
    });
  }

  // If no markdown headers were matched, treat the whole document as one section
  if (sections.length === 0) {
    sections.push({
      heading: 'Main Article Body',
      wordCount: totalWords,
      isUnderdeveloped: totalWords < 1200,
    });
    if (totalWords < 1200) {
      underdevelopedSections.push('Main Article Body');
    }
  }

  return {
    totalWords,
    sections,
    meetsMinimum: totalWords >= 1200,
    targetWordCount: targetTotal,
    underdevelopedSections,
  };
}

