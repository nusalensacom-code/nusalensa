import { GenerationInput, KeywordAnalysis, ArticleOutline, SeoPackage, FaqItem, FactCheckClaim, ResearchSourceItem } from './types';
import { countWords } from './wordCounter';

export interface ProviderStatus {
  configured: boolean;
  provider: 'gemini' | 'openai' | 'none';
  model: string;
  hasWebSearch: boolean;
  message: string;
}

/**
 * Returns current configuration status of AI providers without leaking secret keys.
 */
export function getProviderStatus(): ProviderStatus {
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (geminiKey) {
    return {
      configured: true,
      provider: 'gemini',
      model: 'gemini-1.5-flash',
      hasWebSearch: true,
      message: 'Google Gemini AI provider is connected and ready.',
    };
  }

  if (openaiKey) {
    return {
      configured: true,
      provider: 'openai',
      model: 'gpt-4o-mini',
      hasWebSearch: true,
      message: 'OpenAI provider is connected and ready.',
    };
  }

  return {
    configured: false,
    provider: 'none',
    model: 'built-in-synthesizer',
    hasWebSearch: false,
    message: 'No live AI API key configured. Add GEMINI_API_KEY or OPENAI_API_KEY to your .env file.',
  };
}

/**
 * Robust JSON cleaner for LLM outputs (removes ```json markdown tags, trims whitespace)
 */
export function extractCleanJson<T>(rawText: string, fallback: T): T {
  if (!rawText) return fallback;
  try {
    const cleaned = rawText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    return JSON.parse(cleaned) as T;
  } catch (err) {
    // Attempt regex extraction if wrapped in extraneous text
    const jsonMatch = rawText.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]) as T;
      } catch {}
    }
    return fallback;
  }
}

/**
 * Calls Google Gemini API with timeout and error handling.
 */
async function callGemini(apiKey: string, prompt: string, systemInstruction?: string, temperature = 0.4): Promise<string> {
  const model = 'gemini-1.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

  try {
    const bodyPayload: any = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature,
        maxOutputTokens: 8192,
      },
    };

    if (systemInstruction) {
      bodyPayload.systemInstruction = {
        parts: [{ text: systemInstruction }],
      };
    }

    const res = await fetch(url, {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyPayload),
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errBody = await res.text().catch(() => '');
      throw new Error(`Gemini API error (HTTP ${res.status}): ${errBody.slice(0, 200)}`);
    }

    const data = await res.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) {
      throw new Error('Gemini API returned an empty completion response.');
    }

    return candidateText;
  } catch (err: any) {
    clearTimeout(timeoutId);
    throw err;
  }
}

/**
 * Calls OpenAI API with timeout and error handling.
 */
async function callOpenAi(apiKey: string, prompt: string, systemInstruction?: string, temperature = 0.4): Promise<string> {
  const url = 'https://api.openai.com/v1/chat/completions';
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000);

  try {
    const messages = [];
    if (systemInstruction) {
      messages.push({ role: 'system', content: systemInstruction });
    }
    messages.push({ role: 'user', content: prompt });

    const res = await fetch(url, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        temperature,
        max_tokens: 4096,
      }),
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errBody = await res.text().catch(() => '');
      throw new Error(`OpenAI API error (HTTP ${res.status}): ${errBody.slice(0, 200)}`);
    }

    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content;
    if (!text) throw new Error('OpenAI returned an empty response.');

    return text;
  } catch (err: any) {
    clearTimeout(timeoutId);
    throw err;
  }
}

/**
 * Universal text generation gateway supporting configured LLMs or gracefully falling back.
 */
export async function executeAiCompletion(
  prompt: string,
  options: { systemInstruction?: string; temperature?: number } = {}
): Promise<string> {
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (geminiKey) {
    try {
      return await callGemini(geminiKey, prompt, options.systemInstruction, options.temperature);
    } catch (err: any) {
      console.warn('[AiProvider] Gemini call failed, checking alternatives:', err.message);
    }
  }

  if (openaiKey) {
    try {
      return await callOpenAi(openaiKey, prompt, options.systemInstruction, options.temperature);
    } catch (err: any) {
      console.warn('[AiProvider] OpenAI call failed:', err.message);
    }
  }

  throw new Error('NO_CONFIGURED_PROVIDER: Please set GEMINI_API_KEY or OPENAI_API_KEY in your environment variables (.env).');
}

