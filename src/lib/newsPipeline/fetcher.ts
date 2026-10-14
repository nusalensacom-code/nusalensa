export interface RawNewsArticle {
  title: string;
  url: string;
  summary: string;
  publishedAt: Date;
  imageUrl?: string;
  sourceName: string;
  sourceId?: number;
}

/**
 * Strips HTML tags and unescapes basic HTML entities
 */
function cleanHtml(raw: string): string {
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

/**
 * Extracts the first image URL found in XML or HTML snippet
 */
function extractImageUrl(snippet: string): string | undefined {
  if (!snippet) return undefined;

  // Check <enclosure url="..." /> or <media:content url="..." />
  const enclosureMatch = snippet.match(/<(?:enclosure|media:content|media:thumbnail)[^>]+url=["']([^"']+)["']/i);
  if (enclosureMatch && enclosureMatch[1]) {
    return enclosureMatch[1].trim();
  }

  // Check <img src="..." />
  const imgMatch = snippet.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (imgMatch && imgMatch[1]) {
    return imgMatch[1].trim();
  }

  return undefined;
}

/**
 * Robust zero-dependency RSS / Atom XML Feed Parser
 */
export async function fetchNewsFeed(feedUrl: string, sourceName: string, sourceId?: number): Promise<RawNewsArticle[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s timeout

    const res = await fetch(feedUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; NusaLensa-NewsBot/1.0; +https://nusalensa.com)',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*',
      },
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn(`[NewsFetcher] Failed to fetch feed ${feedUrl}: status ${res.status}`);
      return [];
    }

    const xmlText = await res.text();
    const articles: RawNewsArticle[] = [];

    // Split items by <item> or <entry> without relying on 's' flag
    const itemRegex = /<(?:item|entry)[\s>]([\s\S]*?)<\/(?:item|entry)>/gi;
    let match: RegExpExecArray | null;

    while ((match = itemRegex.exec(xmlText)) !== null) {
      const itemBlock = match[1];

      // Extract Title
      const titleMatch = itemBlock.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
      const title = titleMatch ? cleanHtml(titleMatch[1]) : '';
      if (!title || title.length < 5) continue;

      // Extract Link
      let link = '';
      const linkHrefMatch = itemBlock.match(/<link[^>]+href=["']([^"']+)["']/i);
      const linkTagMatch = itemBlock.match(/<link[^>]*>([\s\S]*?)<\/link>/i);

      if (linkHrefMatch && linkHrefMatch[1]) {
        link = linkHrefMatch[1].trim();
      } else if (linkTagMatch && linkTagMatch[1]) {
        link = cleanHtml(linkTagMatch[1]);
      }

      if (!link || !link.startsWith('http')) continue;

      // Extract Summary / Description
      const descMatch =
        itemBlock.match(/<description[^>]*>([\s\S]*?)<\/description>/i) ||
        itemBlock.match(/<summary[^>]*>([\s\S]*?)<\/summary>/i) ||
        itemBlock.match(/<content[^>]*>([\s\S]*?)<\/content>/i);
      const rawDesc = descMatch ? descMatch[1] : '';
      const summary = cleanHtml(rawDesc);

      // Extract Image
      const imageUrl = extractImageUrl(itemBlock);

      // Extract Publication Date
      const dateMatch =
        itemBlock.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i) ||
        itemBlock.match(/<published[^>]*>([\s\S]*?)<\/published>/i) ||
        itemBlock.match(/<updated[^>]*>([\s\S]*?)<\/updated>/i) ||
        itemBlock.match(/<dc:date[^>]*>([\s\S]*?)<\/dc:date>/i);

      let pubDate = new Date();
      if (dateMatch && dateMatch[1]) {
        const parsed = new Date(dateMatch[1].trim());
        if (!isNaN(parsed.getTime())) {
          pubDate = parsed;
        }
      }

      articles.push({
        title,
        url: link,
        summary: summary || title,
        publishedAt: pubDate,
        imageUrl,
        sourceName,
        sourceId,
      });

      // Limit per feed batch to 15 latest items
      if (articles.length >= 15) break;
    }

    return articles;
  } catch (error: any) {
    console.error(`[NewsFetcher] Error parsing feed ${feedUrl}:`, error.message);
    return [];
  }
}
