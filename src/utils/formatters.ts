// src/utils/formatters.ts

export function stripHtml(html: string): string {
  if (!html) return '';

  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&apos;/gi, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&#x2F;/gi, '/')
    .replace(/&hellip;/gi, '...')
    .replace(/&mdash;/gi, '-')
    .replace(/&ndash;/gi, '-')
    .replace(/&lsquo;/gi, "'")
    .replace(/&rsquo;/gi, "'")
    .replace(/&ldquo;/gi, '"')
    .replace(/&rdquo;/gi, '"')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+/g, ' ')
    .trim();
}

export function timeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "short",
    year: diffDays > 365 ? "numeric" : undefined,
  });
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function truncate(text: string, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3).trimEnd() + "...";
}

export function cleanAndTruncate(text: string, maxLength: number): string {
  return truncate(stripHtml(text), maxLength);
}

export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

export function generateTipReference(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `CSHAD-${code.slice(0, 4)}-${code.slice(4, 8)}`;
}

/**
 * Extract all image URLs from HTML content.
 * Supports <img src>, <img data-src>, srcset, and Markdown.
 */
export function extractAllImages(html?: string): string[] {
  if (!html) return [];
  const images: string[] = [];

  // <img src="...">
  const imgSrcRegex = /<img[^>]+src\s*=\s*["']([^"']+)["']/gi;
  let match: RegExpExecArray | null;
  while ((match = imgSrcRegex.exec(html)) !== null) {
    if (match[1]) images.push(match[1]);
  }

  // <img data-src="..."> (lazy loading)
  const dataSrcRegex = /<img[^>]+data-src\s*=\s*["']([^"']+)["']/gi;
  while ((match = dataSrcRegex.exec(html)) !== null) {
    if (match[1]) images.push(match[1]);
  }

  // srcset: choose the largest candidate
  const srcsetRegex = /<img[^>]+srcset\s*=\s*["']([^"']+)["']/gi;
  while ((match = srcsetRegex.exec(html)) !== null) {
    const candidates = match[1]
      .split(',')
      .map((entry) => entry.trim().split(' ')[0])
      .filter((url) => url && url.startsWith('http'));
    if (candidates.length > 0) {
      images.push(candidates[candidates.length - 1]);
    }
  }

  // Markdown ![](...)
  const mdRegex = /!\[.*?\]\(\s*(https?:\/\/[^\s)]+)\s*\)/gi;
  while ((match = mdRegex.exec(html)) !== null) {
    if (match[1]) images.push(match[1]);
  }

  // Deduplicate and filter junk
  const filtered = images
    .filter((url) => url && url.startsWith('http'))
    .filter((url) => !url.startsWith('data:'))
    .filter((url) => !/spacer|blank|pixel|1x1\.(gif|png|jpg)/i.test(url))
    .filter((url, index, arr) => arr.indexOf(url) === index);

  return filtered;
}

/**
 * Extract the first meaningful image URL from HTML.
 * This is used for card thumbnails.
 */
export function extractFirstImage(html?: string): string | null {
  const images = extractAllImages(html);
  return images[0] || null;
}

/**
 * Extract the best image URL from HTML.
 * Prefers the first image in the body, then summary, then imageUrl.
 */
export function extractBestImage(
  imageUrl?: string,
  body?: string,
  summary?: string
): string | null {
  const candidates = [
    imageUrl,
    extractFirstImage(body),
    extractFirstImage(summary),
  ];
  for (const candidate of candidates) {
    if (candidate) return candidate;
  }
  return null;
}

export type ArticleBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'image'; url: string }
  | { type: 'heading'; text: string };

/**
 * Parse HTML article body into blocks:
 * paragraphs, headings, and images.
 */
export function parseArticleContent(html?: string): ArticleBlock[] {
  if (!html) return [];
  const blocks: ArticleBlock[] = [];

  // Split by block tags
  const parts = html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/h[1-6]>/gi, '\n\n')
    .split(/\n{2,}/);

  for (const part of parts) {
    // Image block
    const imgMatch = part.match(/<img[^>]+src\s*=\s*["']([^"']+)["']/i);
    if (imgMatch) {
      blocks.push({ type: 'image', url: imgMatch[1] });
      // Also include any text outside the image
      const text = stripHtml(part.replace(/<img[^>]*>/gi, ''));
      if (text.trim()) blocks.push({ type: 'paragraph', text: text.trim() });
      continue;
    }

    // Heading block
    const headingMatch = part.match(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/i);
    if (headingMatch) {
      blocks.push({ type: 'heading', text: stripHtml(headingMatch[1]).trim() });
      continue;
    }

    // Paragraph block
    const text = stripHtml(part).trim();
    if (text) blocks.push({ type: 'paragraph', text });
  }

  return blocks;
}