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

function decodeHtmlEntities(html: string): string {
  if (!html) return '';
  return html
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&apos;/gi, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&hellip;/gi, '...')
    .replace(/&mdash;/gi, '-')
    .replace(/&ndash;/gi, '-')
    .replace(/&lsquo;/gi, "'")
    .replace(/&rsquo;/gi, "'")
    .replace(/&ldquo;/gi, '"')
    .replace(/&rdquo;/gi, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

function resolveUrl(url: string, baseUrl?: string): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  if (baseUrl) {
    const base = new URL(baseUrl);
    return new URL(url, base.origin).toString();
  }
  return url;
}

function extractImageUrlFromImgTag(imgTag: string): string | null {
  let src = imgTag.match(/src\s*=\s*["']([^"']+)["']/i)?.[1];
  if (src && src.trim()) return src.trim();
  src = imgTag.match(/data-src\s*=\s*["']([^"']+)["']/i)?.[1];
  if (src && src.trim()) return src.trim();
  const srcset = imgTag.match(/srcset\s*=\s*["']([^"']+)["']/i)?.[1];
  if (srcset) {
    const candidates = srcset
      .split(',')
      .map((s) => s.trim().split(' ')[0])
      .filter((u) => u && u.startsWith('http'));
    if (candidates.length > 0) return candidates[candidates.length - 1];
  }
  return null;
}

function extractImageUrlFromBlock(block: string): string | null {
  // <figure> with <img>
  const figureImg = block.match(/<img[^>]*>/i);
  if (figureImg) {
    const url = extractImageUrlFromImgTag(figureImg[0]);
    if (url) return url;
  }
  // <picture> with <source>
  const source = block.match(/<source[^>]+srcset\s*=\s*["']([^"']+)["']/i);
  if (source) {
    const candidates = source[1]
      .split(',')
      .map((s) => s.trim().split(' ')[0])
      .filter((u) => u && u.startsWith('http'));
    if (candidates.length > 0) return candidates[candidates.length - 1];
  }
  // Direct <img>
  return extractImageUrlFromImgTag(block);
}

function extractCaption(block: string): string | null {
  let caption = block.match(/alt\s*=\s*["']([^"']*)["']/i)?.[1]?.trim() || '';
  if (!caption) caption = block.match(/title\s*=\s*["']([^"']*)["']/i)?.[1]?.trim() || '';
  if (!caption) caption = block.match(/figcaption[^>]*>([\s\S]*?)<\/figcaption>/i)?.[1]?.trim() || '';
  if (caption) {
    caption = decodeHtmlEntities(caption.replace(/<[^>]*>/g, ' ')).trim();
  }
  return caption || null;
}

function extractYouTubeVideoIdFromIframe(iframe: string): string | null {
  const src = iframe.match(/src\s*=\s*["']([^"']+)["']/i)?.[1] || '';
  if (!src) return null;
  const patterns = [
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = src.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export type ArticleBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; text: string }
  | { type: 'image'; url: string; caption?: string; credit?: string }
  | { type: 'list'; ordered: boolean; items: string[] }
  | { type: 'video'; videoId: string; provider: 'youtube'; caption?: string }
  | { type: 'quote'; text: string; source?: string };

function addPlainTextParagraphs(text: string, blocks: ArticleBlock[]) {
  const clean = decodeHtmlEntities(text.replace(/<[^>]*>/g, ' ')).trim();
  const paragraphs = clean.split(/\n{2,}/).map(p => p.trim()).filter(Boolean);
  for (const p of paragraphs) {
    blocks.push({ type: 'paragraph', text: p });
  }
}

function processBlock(block: string, blocks: ArticleBlock[]) {
  const trimmed = block.trim();
  if (!trimmed) return;

  // YouTube iframe
  const videoId = extractYouTubeVideoIdFromIframe(trimmed);
  if (videoId) {
    const caption = extractCaption(trimmed) || undefined;
    blocks.push({ type: 'video', videoId, provider: 'youtube', caption });
    return;
  }

  // Image / figure / picture
  if (/^<(img|figure|picture)/i.test(trimmed)) {
    const url = extractImageUrlFromBlock(trimmed);
    if (url) {
      const caption = extractCaption(trimmed) || undefined;
      blocks.push({ type: 'image', url, caption });
    }
    return;
  }

  // List
  if (/^<(ul|ol)/i.test(trimmed)) {
    const ordered = /^<ol/i.test(trimmed);
    const items: string[] = [];
    const liRegex = /<li[^>]*>([\s\S]*?)<\/li>/gi;
    let m: RegExpExecArray | null;
    while ((m = liRegex.exec(trimmed)) !== null) {
      const text = decodeHtmlEntities(m[1].replace(/<[^>]*>/g, ' ')).trim();
      if (text) items.push(text);
    }
    if (items.length > 0) blocks.push({ type: 'list', ordered, items });
    return;
  }

  // Blockquote
  if (/^<blockquote/i.test(trimmed)) {
    const text = decodeHtmlEntities(trimmed.replace(/<[^>]*>/g, ' ')).trim();
    const source = trimmed.match(/cite\s*=\s*["']([^"']+)["']/i)?.[1] || undefined;
    if (text) blocks.push({ type: 'quote', text, source });
    return;
  }

  // Heading
  if (/^<h[1-6]/i.test(trimmed)) {
    const text = decodeHtmlEntities(trimmed.replace(/<[^>]*>/g, ' ')).trim();
    if (text) blocks.push({ type: 'heading', text });
    return;
  }

  // Paragraph
  if (/^<p/i.test(trimmed)) {
    const text = decodeHtmlEntities(trimmed.replace(/<[^>]*>/g, ' ')).trim();
    if (text) blocks.push({ type: 'paragraph', text });
    return;
  }

  // Fallback plain text
  const plain = decodeHtmlEntities(trimmed.replace(/<[^>]*>/g, ' ')).trim();
  if (plain) blocks.push({ type: 'paragraph', text: plain });
}

export function parseArticleHtml(html?: string, baseUrl?: string): ArticleBlock[] {
  if (!html) return [];

  let content = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '');

  const blocks: ArticleBlock[] = [];
  const blockRegex = /(<blockquote[^>]*>[\s\S]*?<\/blockquote>|<figure[\s\S]*?<\/figure>|<picture[\s\S]*?<\/picture>|<iframe[^>]*>[\s\S]*?<\/iframe>|<ul[^>]*>[\s\S]*?<\/ul>|<ol[^>]*>[\s\S]*?<\/ol>|<p[^>]*>[\s\S]*?<\/p>|<h[1-6][^>]*>[\s\S]*?<\/h[1-6]>|<img[^>]*>)/gi;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = blockRegex.exec(content)) !== null) {
    const before = content.slice(lastIndex, match.index);
    if (before.trim()) addPlainTextParagraphs(before, blocks);
    processBlock(match[0], blocks);
    lastIndex = match.index + match[0].length;
  }

  const after = content.slice(lastIndex);
  if (after.trim()) addPlainTextParagraphs(after, blocks);

  // Resolve relative image URLs
  return blocks.map((block) => {
    if (block.type === 'image') {
      return { ...block, url: resolveUrl(block.url, baseUrl) };
    }
    return block;
  });
}

// Legacy alias
export function parseArticleContent(html?: string, baseUrl?: string): ArticleBlock[] {
  return parseArticleHtml(html, baseUrl);
}

export function extractAllImages(html?: string): string[] {
  if (!html) return [];
  const images: string[] = [];

  // Standard and lazy-loaded images
  const imgRegex = /<img[^>]+(?:src|data-src|srcset)\s*=\s*["']([^"']+)["']/gi;
  let match: RegExpExecArray | null;
  while ((match = imgRegex.exec(html)) !== null) {
    const value = match[1];
    if (value.includes(',')) {
      value.split(',').forEach((candidate) => {
        const url = candidate.trim().split(' ')[0];
        if (url && url.startsWith('http')) images.push(url);
      });
    } else if (value.startsWith('http')) {
      images.push(value);
    }
  }

  // <picture> / <source>
  const sourceRegex = /<source[^>]+srcset\s*=\s*["']([^"']+)["']/gi;
  while ((match = sourceRegex.exec(html)) !== null) {
    match[1].split(',').forEach((candidate) => {
      const url = candidate.trim().split(' ')[0];
      if (url && url.startsWith('http')) images.push(url);
    });
  }

  // Markdown images
  const mdRegex = /!\[.*?\]\(\s*(https?:\/\/[^\s)]+)\s*\)/gi;
  while ((match = mdRegex.exec(html)) !== null) {
    images.push(match[1]);
  }

  return images
    .filter((url) => url && url.startsWith('http'))
    .filter((url) => !/spacer|blank|pixel|1x1\.(gif|png|jpg)/i.test(url))
    .filter((url, index, arr) => arr.indexOf(url) === index);
}

export function extractFirstImage(html?: string): string | null {
  const images = extractAllImages(html);
  return images[0] || null;
}

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