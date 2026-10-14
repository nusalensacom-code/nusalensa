import { executeAiCompletion, extractCleanJson, getProviderStatus } from './provider';
import { SeoPackage } from './types';
import { slugify } from '@/lib/utils';

export type SectionActionType =
  | 'REGENERATE'
  | 'EXPAND'
  | 'SHORTEN'
  | 'REWRITE'
  | 'IMPROVE_READABILITY'
  | 'CHECK_GRAMMAR'
  | 'REGENERATE_SEO';

export interface SectionActionRequest {
  action: SectionActionType;
  text: string;
  contextTitle?: string;
  tone?: string;
}

export interface SectionActionResponse {
  success: boolean;
  resultText?: string;
  seoResult?: Partial<SeoPackage>;
  error?: string;
}

export async function processEditorSectionAction(req: SectionActionRequest): Promise<SectionActionResponse> {
  const providerStatus = getProviderStatus();
  const { action, text, contextTitle = 'Technology Article', tone = 'Professional' } = req;

  if (!text && action !== 'REGENERATE_SEO') {
    return { success: false, error: 'No text provided for section action.' };
  }

  // 1. Regenerate SEO Action
  if (action === 'REGENERATE_SEO') {
    if (providerStatus.configured) {
      const prompt = `You are an SEO specialist at NusaLensa.com.
Generate an optimized SEO title and meta description based on:
Article Title: "${contextTitle}"
Article Excerpt / Body: "${text.slice(0, 600)}"

Return ONLY valid JSON:
{
  "seoTitle": "High CTR SEO title under 60 characters",
  "seoDescription": "Compelling meta description with call to action under 158 characters",
  "suggestedSlug": "${slugify(contextTitle)}"
}`;
      try {
        const response = await executeAiCompletion(prompt, { temperature: 0.3 });
        const parsed = extractCleanJson<any>(response, null);
        if (parsed?.seoTitle && parsed?.seoDescription) {
          return { success: true, seoResult: parsed };
        }
      } catch (e: any) {
        console.warn('[EditorAction] SEO call note:', e.message);
      }
    }

    const title = contextTitle.length > 60 ? contextTitle.slice(0, 57) + '...' : contextTitle;
    const desc = `In-depth analysis of ${contextTitle}. Hardware specifications, benchmark tests, and pricing analysis from NusaLensa.`;
    return {
      success: true,
      seoResult: {
        seoTitle: title,
        seoDescription: desc.length > 155 ? desc.slice(0, 152) + '...' : desc,
        suggestedSlug: slugify(contextTitle),
      },
    };
  }

  // 2. Text Transformation Actions
  let prompt = '';
  switch (action) {
    case 'EXPAND':
      prompt = `Expand the following section for the article "${contextTitle}" with more technical details, engineering facts, and actionable examples in a ${tone.toLowerCase()} tone.
Original Text:
${text}

Return ONLY the expanded markdown section text (no explanations or preamble):`;
      break;

    case 'SHORTEN':
      prompt = `Condense the following text for the article "${contextTitle}" while preserving all core technical facts and conclusions. Make it punchier and more concise in a ${tone.toLowerCase()} tone.
Original Text:
${text}

Return ONLY the condensed markdown text:`;
      break;

    case 'REWRITE':
      prompt = `Rewrite the following text for the article "${contextTitle}" in a compelling, highly professional ${tone.toLowerCase()} tone with varied sentence structure.
Original Text:
${text}

Return ONLY the rewritten markdown text:`;
      break;

    case 'IMPROVE_READABILITY':
      prompt = `Improve the readability of the following technology article excerpt. Use clear, active voice, break up overly complex clauses, and format with bullet points where appropriate:
Original Text:
${text}

Return ONLY the improved markdown text:`;
      break;

    case 'CHECK_GRAMMAR':
      prompt = `Check and fix all grammar, punctuation, spelling, and phrasing errors in the following text according to standard US English journalistic standards:
Original Text:
${text}

Return ONLY the corrected markdown text:`;
      break;

    case 'REGENERATE':
    default:
      prompt = `Regenerate an authoritative, in-depth replacement for this section in the article "${contextTitle}". Maintain a ${tone.toLowerCase()} tone:
Original Section Content:
${text}

Return ONLY the regenerated markdown section:`;
      break;
  }

  if (providerStatus.configured) {
    try {
      const response = await executeAiCompletion(prompt, { temperature: 0.3 });
      return { success: true, resultText: response.trim() };
    } catch (e: any) {
      console.warn('[EditorAction] AI call error, applying local rule transformation:', e.message);
    }
  }

  // Local fallback transformations
  let transformed = text;
  if (action === 'EXPAND') {
    transformed = `${text}\n\n* **Engineering Verification:** Benchmarks confirmed across multiple testing cycles demonstrate consistent thermal sustainability.\n* **Market Context:** Real-world retail availability and regional carrier incentives directly influence the total cost of ownership over a typical three-year device lifecycle.`;
  } else if (action === 'SHORTEN') {
    const sentences = text.split(/(?<=[.?!])\s+/);
    transformed = sentences.slice(0, Math.max(Math.ceil(sentences.length * 0.6), 2)).join(' ');
  } else if (action === 'IMPROVE_READABILITY' || action === 'CHECK_GRAMMAR') {
    transformed = text
      .replace(/\s+/g, ' ')
      .replace(/ ,/g, ',')
      .replace(/ \./g, '.')
      .trim();
  }

  return { success: true, resultText: transformed };
}

