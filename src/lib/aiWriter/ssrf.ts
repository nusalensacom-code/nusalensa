import http from 'http';
import https from 'https';
import dns from 'dns';
import { promisify } from 'util';

const dnsLookup = promisify(dns.lookup);

/**
 * Checks if an IP address falls within private, loopback, or cloud metadata ranges.
 */
export function isPrivateOrReservedIp(ip: string): boolean {
  // IPv4 loopback
  if (ip.startsWith('127.')) return true;
  // Private 10.0.0.0/8
  if (ip.startsWith('10.')) return true;
  // Private 192.168.0.0/16
  if (ip.startsWith('192.168.')) return true;
  // Cloud metadata service (AWS/GCP/Azure)
  if (ip === '169.254.169.254' || ip.startsWith('169.254.')) return true;
  // Local network / Current host
  if (ip === '0.0.0.0' || ip === '::' || ip === '::1') return true;

  // Private 172.16.0.0/12 (172.16.0.0 - 172.31.255.255)
  if (ip.startsWith('172.')) {
    const parts = ip.split('.').map((p) => parseInt(p, 10));
    if (parts.length >= 2 && parts[1] >= 16 && parts[1] <= 31) {
      return true;
    }
  }

  // Carrier-grade NAT (100.64.0.0/10)
  if (ip.startsWith('100.')) {
    const parts = ip.split('.').map((p) => parseInt(p, 10));
    if (parts.length >= 2 && parts[1] >= 64 && parts[1] <= 127) {
      return true;
    }
  }

  return false;
}

/**
 * Validates a user-provided URL against SSRF vulnerabilities before fetching.
 */
export async function validateSafeUrl(rawUrl: string): Promise<{ isSafe: boolean; reason?: string; parsedUrl?: URL }> {
  try {
    const parsed = new URL(rawUrl);

    // 1. Only allow standard HTTP/HTTPS protocols
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { isSafe: false, reason: `Disallowed protocol "${parsed.protocol}". Only HTTP and HTTPS are permitted.` };
    }

    const hostname = parsed.hostname.toLowerCase();

    // 2. Reject obvious loopback and internal hostname strings
    if (
      hostname === 'localhost' ||
      hostname.endsWith('.localhost') ||
      hostname.endsWith('.local') ||
      hostname.endsWith('.internal') ||
      hostname.endsWith('.corp')
    ) {
      return { isSafe: false, reason: 'Access to local or internal hostnames is prohibited.' };
    }

    // 3. DNS resolution check to verify the target IP is public
    try {
      const lookupResult = await dnsLookup(hostname);
      if (isPrivateOrReservedIp(lookupResult.address)) {
        return { isSafe: false, reason: `Resolved IP (${lookupResult.address}) belongs to a private or restricted network.` };
      }
    } catch (dnsErr: any) {
      return { isSafe: false, reason: `DNS lookup failed for host ${hostname}: ${dnsErr.message}` };
    }

    return { isSafe: true, parsedUrl: parsed };
  } catch (err: any) {
    return { isSafe: false, reason: `Invalid URL format: ${err.message}` };
  }
}

/**
 * Safely fetches text content from an external reference URL with size limits and timeouts.
 */
export async function fetchSafeReferenceContent(url: string, maxBytes = 400000): Promise<{ title: string; content: string; url: string } | null> {
  const safety = await validateSafeUrl(url);
  if (!safety.isSafe) {
    console.warn(`[SSRF Defense] Blocked fetch to ${url}: ${safety.reason}`);
    return null;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 (NusaLensa-ResearchBot/1.0)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn(`[ReferenceFetcher] HTTP ${res.status} when fetching ${url}`);
      return null;
    }

    const html = await res.text();
    const truncatedHtml = html.slice(0, maxBytes);

    // Extract page title
    const titleMatch = truncatedHtml.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1].replace(/\s+/g, ' ').trim() : 'External Reference';

    // Extract readable body text, stripping scripts, styles, and prompt injection traps
    let cleanText = truncatedHtml
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
      .replace(/<!--[\s\S]*?-->/g, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/\s+/g, ' ')
      .trim();

    // Defense against prompt override attacks in scraped pages
    cleanText = cleanText
      .replace(/ignore (?:all )?previous instructions/gi, '[filtered]')
      .replace(/system prompt/gi, '[system note]')
      .slice(0, 15000); // Max 15k characters for LLM context

    return {
      title,
      content: cleanText,
      url,
    };
  } catch (e: any) {
    console.warn(`[ReferenceFetcher] Error fetching ${url}:`, e.message);
    return null;
  }
}

