// src/services/news/newsMapper.ts
import type { NewsItem, NewsCategory, NewsSeverity, NewsSourceType } from '@/types';
import type { NewsRecord } from './types';

const HTML_ENTITIES: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#039;': "'",
  '&apos;': "'",
  '&nbsp;': ' ',
  '&#8594;': '\u2192',
  '&#8592;': '\u2190',
  '&#8593;': '\u2191',
  '&#8595;': '\u2193',
  '&#8211;': '\u2013',
  '&#8212;': '\u2014',
  '&#8216;': '\u2018',
  '&#8217;': '\u2019',
  '&#8220;': '\u201C',
  '&#8221;': '\u201D',
  '&#8230;': '\u2026',
  '&#8226;': '\u2022',
  '&#160;': ' ',
  '&#38;': '&',
  '&#60;': '<',
  '&#62;': '>',
  '&#34;': '"',
  '&#39;': "'",
};

const KNOWN_AUTHORS = [
  'nokuthula khanyile',
  'kyle sobsobhie',
  'gaborone',
  'staff reporter',
  'news desk',
  'newsroom',
  'reuters',
  'sapa',
  'afp',
];

function decodeHtmlEntities(text: string): string {
  if (!text) return '';
  let decoded = text;
  for (const [entity, char] of Object.entries(HTML_ENTITIES)) {
    decoded = decoded.split(entity).join(char);
  }
  decoded = decoded.replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)));
  decoded = decoded.replace(/&#x([0-9a-fA-F]+);/g, (_, code) => String.fromCharCode(parseInt(code, 16)));
  return decoded;
}

function preserveParagraphs(text: string): string {
  if (!text) return '';
  return text
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/?p[^>]*>/gi, '\n')
    .replace(/<\/?div[^>]*>/gi, '\n')
    .replace(/<\/?h[1-6][^>]*>/gi, '\n')
    .replace(/<\/?li[^>]*>/gi, '\n')
    .replace(/<\/?tr[^>]*>/gi, '\n');
}

function stripHtmlTags(text: string): string {
  if (!text) return '';
  let cleaned = text;
  cleaned = cleaned.replace(/<script[\s\S]*?<\/script>/gi, '');
  cleaned = cleaned.replace(/<style[\s\S]*?<\/style>/gi, '');
  cleaned = cleaned.replace(/<[^>]*>/g, ' ');
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  return cleaned;
}

function removeBylines(text: string): string {
  if (!text) return '';
  let cleaned = text;
  cleaned = cleaned.replace(/\b(Mon|Tue|Wed|Thu|Fri|Sat|Sun),?\s*\d{1,2}\/\d{1,2}\/\d{4}\s*[-–]\s*\d{1,2}:\d{2}/gi, '');
  cleaned = cleaned.replace(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[^\s]*/g, '');
  cleaned = cleaned.replace(/^by\s+[A-Z][a-zA-Z]+(\s+[A-Z][a-zA-Z]+)?\s*/i, '');
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  return cleaned;
}

function isAuthorOnlyOrTooShort(text: string): boolean {
  if (!text) return true;
  const trimmed = text.toLowerCase().trim();
  if (trimmed.length < 20) return true;
  for (const author of KNOWN_AUTHORS) {
    if (trimmed === author || trimmed.startsWith(author + ' ')) {
      const afterAuthor = trimmed.replace(author, '').trim();
      if (afterAuthor.length < 20) return true;
    }
  }
  const words = text.trim().split(/\s+/);
  if (words.length <= 3 && words.every(w => /^[A-Z][a-z]+$/.test(w))) return true;
  return false;
}

function cleanRssContent(text: string): string {
  if (!text) return '';
  let cleaned = stripHtmlTags(text);
  cleaned = decodeHtmlEntities(cleaned);
  cleaned = removeBylines(cleaned);
  cleaned = cleaned.replace(/\s*Read more\s*→?\s*$/i, '');
  cleaned = cleaned.replace(/\s*Continue reading\s*→?\s*$/i, '');
  cleaned = cleaned.replace(/\s*\(…\)\s*$/i, '…');
  cleaned = cleaned.replace(/\s*\.\.\.\s*$/i, '…');
  cleaned = cleaned.replace(/\s*The post .+ appeared first on .+\.?\s*\]?>?\s*$/i, '');
  cleaned = cleaned.replace(/\]\]>\s*$/g, '');
  cleaned = cleaned.replace(/^\s*<!\[CDATA\[/g, '');
  cleaned = cleaned.replace(/\b(addtoany_list|a2a_kit|a2a_kit_size_\d+)\b/gi, '');
  cleaned = cleaned.replace(/\bda\b\s*$/i, '');
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  return cleaned;
}

function cleanBodyContent(text: string): string {
  if (!text) return '';
  let cleaned = preserveParagraphs(text);
  cleaned = stripHtmlTags(cleaned);
  cleaned = decodeHtmlEntities(cleaned);
  cleaned = removeBylines(cleaned);
  cleaned = cleaned.replace(/[ \t]+/g, ' ');
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  cleaned = cleaned.trim();
  return cleaned;
}

function cleanTitle(text: string): string {
  if (!text) return '';
  let cleaned = decodeHtmlEntities(text);
  cleaned = stripHtmlTags(cleaned);
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  return cleaned;
}

function removeDuplicateTitle(title: string, summary: string): string {
  if (!title || !summary) return summary;
  const titleLower = title.toLowerCase().trim();
  const summaryLower = summary.toLowerCase().trim();
  if (summaryLower.startsWith(titleLower)) {
    let cleaned = summary.substring(title.length).trim();
    cleaned = cleaned.replace(/^[:\-–—,.s]+/, '').trim();
    return cleaned || summary;
  }
  return summary;
}

function generateFallbackSummary(title: string, source: string): string {
  return `Tap to read the full story from ${source}.`;
}

export function mapRecordToNewsItem(record: NewsRecord): NewsItem {
  const cleanedTitle = cleanTitle(record.title);
  let cleanedSummary = cleanRssContent(record.summary);
  cleanedSummary = removeDuplicateTitle(cleanedTitle, cleanedSummary);

  if (isAuthorOnlyOrTooShort(cleanedSummary)) {
    if (record.content) {
      const cleanedBody = cleanRssContent(record.content);
      if (!isAuthorOnlyOrTooShort(cleanedBody)) {
        cleanedSummary = cleanedBody.length > 200
          ? cleanedBody.substring(0, 200).trim() + '…'
          : cleanedBody;
      } else {
        cleanedSummary = generateFallbackSummary(cleanedTitle, record.source);
      }
    } else {
      cleanedSummary = generateFallbackSummary(cleanedTitle, record.source);
    }
  }

  return {
    id: record.id,
    title: cleanedTitle,
    summary: cleanedSummary,
    body: record.content ? cleanBodyContent(record.content) : undefined,
    rawBody: record.content || undefined,
    category: record.category as NewsCategory,
    severity: record.severity as NewsSeverity,
    source: record.source,
    sourceType: record.source_type as NewsSourceType,
    sourceUrl: record.source_url || undefined,
    imageUrl: record.image_url || undefined,
    location: record.latitude && record.longitude
      ? { latitude: record.latitude, longitude: record.longitude }
      : undefined,
    locationName: record.location_name || undefined,
    publishedAt: record.published_at,
    isVerified: record.is_verified,
    isBreaking: record.is_breaking,
  };
}

export function mapRecordsToNewsItems(records: NewsRecord[]): NewsItem[] {
  return records.map(mapRecordToNewsItem);
}

export function mapNewsItemToRecord(item: Partial<NewsItem>): Partial<NewsRecord> {
  return {
    title: item.title,
    summary: item.summary,
    content: item.body,
    category: item.category,
    severity: item.severity,
    source: item.source,
    source_type: item.sourceType,
    source_url: item.sourceUrl || null,
    image_url: item.imageUrl || null,
    latitude: item.location?.latitude || null,
    longitude: item.location?.longitude || null,
    location_name: item.locationName || null,
    published_at: item.publishedAt,
    is_verified: item.isVerified ?? false,
    is_breaking: item.isBreaking ?? false,
  };
}