/**
 * Utility functions for NusaLensa - Global Technology Platform
 */

export function formatDateEnglish(dateInput: string | Date | number | undefined | null): string {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) {
    return String(dateInput);
  }
  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  };
  try {
    return new Intl.DateTimeFormat('en-US', options).format(date);
  } catch (e) {
    return String(dateInput);
  }
}

export function formatDateTimeEnglish(dateInput: string | Date | number | undefined | null): string {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) {
    return String(dateInput);
  }
  const dateStr = formatDateEnglish(date);
  try {
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    return `${dateStr} · ${hours}:${minutes} UTC`;
  } catch (e) {
    return dateStr;
  }
}

export function timeAgo(dateInput: string | Date | number | undefined | null): string {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) {
    return String(dateInput);
  }
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays}d ago`;
  return formatDateEnglish(date);
}

// Backwards compatibility aliases
export const formatDateIndonesian = formatDateEnglish;
export const formatDateTimeIndonesian = formatDateTimeEnglish;
export const timeAgoEnglish = timeAgo;
export const timeAgoIndonesian = timeAgo;

export function calculateReadingTime(text: string): number {
  if (!text) return 1;
  const wordsPerMinute = 200;
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start
    .replace(/-+$/, ''); // Trim - from end
}

export function truncateText(text: string, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

/**
 * Cleanly format international currencies (USD, GBP, EUR, AUD, CAD)
 */
export function formatCurrency(amount: number | null | undefined, currency: string = 'USD'): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return 'Price varies by market';
  }
  const symbols: Record<string, string> = {
    USD: '$',
    GBP: '£',
    EUR: '€',
    AUD: 'A$',
    CAD: 'C$',
  };
  const sym = symbols[currency.toUpperCase()] || `${currency} `;
  return `${sym}${amount.toLocaleString('en-US')}`;
}

/**
 * Clean and render Markdown content into safe, semantic HTML
 */
export function renderArticleMarkdown(markdown: string): string {
  if (!markdown) return '';

  const lines = markdown.split('\n');
  const output: string[] = [];
  let inList = false;
  let inOrderedList = false;
  let inBlockquote = false;
  let blockquoteContent: string[] = [];

  const closeListIfNeeded = () => {
    if (inList) {
      output.push('</ul>');
      inList = false;
    }
    if (inOrderedList) {
      output.push('</ol>');
      inOrderedList = false;
    }
  };

  const closeBlockquoteIfNeeded = () => {
    if (inBlockquote) {
      output.push(
        `<blockquote class="border-l-4 border-brand-500 pl-4 py-2 my-6 italic text-slate-700 bg-slate-50 rounded-r-lg font-serif text-lg">${blockquoteContent.join(' ')}</blockquote>`
      );
      inBlockquote = false;
      blockquoteContent = [];
    }
  };

  for (let line of lines) {
    line = line.trim();

    if (!line) {
      closeListIfNeeded();
      closeBlockquoteIfNeeded();
      continue;
    }

    // Blockquote
    if (line.startsWith('>')) {
      closeListIfNeeded();
      inBlockquote = true;
      blockquoteContent.push(line.replace(/^>\s*/, ''));
      continue;
    } else {
      closeBlockquoteIfNeeded();
    }

    // Headings
    if (line.startsWith('### ')) {
      closeListIfNeeded();
      const text = line.replace('### ', '');
      const id = slugify(text);
      output.push(`<h3 id="${id}" class="text-xl font-bold text-slate-900 mt-8 mb-3 tracking-tight">${text}</h3>`);
      continue;
    }

    if (line.startsWith('## ')) {
      closeListIfNeeded();
      const text = line.replace('## ', '');
      const id = slugify(text);
      output.push(
        `<h2 id="${id}" class="text-2xl sm:text-3xl font-bold text-slate-900 mt-10 mb-4 tracking-tight border-b border-slate-100 pb-2">${text}</h2>`
      );
      continue;
    }

    // Unordered List
    if (line.startsWith('- ') || line.startsWith('* ')) {
      if (inOrderedList) {
        output.push('</ol>');
        inOrderedList = false;
      }
      if (!inList) {
        output.push('<ul class="list-disc pl-6 space-y-2 my-4 text-slate-700 leading-relaxed">');
        inList = true;
      }
      let content = line.substring(2);
      content = formatInlineMarkdown(content);
      output.push(`<li>${content}</li>`);
      continue;
    }

    // Ordered List
    const orderedMatch = line.match(/^(\d+)\.\s+(.*)/);
    if (orderedMatch) {
      if (inList) {
        output.push('</ul>');
        inList = false;
      }
      if (!inOrderedList) {
        output.push('<ol class="list-decimal pl-6 space-y-2 my-4 text-slate-700 leading-relaxed">');
        inOrderedList = true;
      }
      let content = orderedMatch[2];
      content = formatInlineMarkdown(content);
      output.push(`<li>${content}</li>`);
      continue;
    }

    closeListIfNeeded();

    // Regular Paragraph
    let pContent = formatInlineMarkdown(line);
    output.push(`<p class="text-slate-800 text-lg leading-relaxed mb-6 font-normal">${pContent}</p>`);
  }

  closeListIfNeeded();
  closeBlockquoteIfNeeded();

  return output.join('\n');
}

function formatInlineMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-slate-900">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
    .replace(/`(.*?)`/g, '<code class="bg-slate-100 text-brand-700 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-brand-600 hover:text-brand-700 underline underline-offset-2">$1</a>');
}
