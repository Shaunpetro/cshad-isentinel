// src/services/news/newsMapper.ts
import type { NewsItem, NewsCategory, NewsSeverity, NewsSourceType } from '@/types';
import type { NewsRecord } from './types';

/**
 * HTML entities mapping for decoding
 */
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

/**
 * Common journalist/author names to filter out when they appear alone
 */
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

/**
 * Decode HTML entities in text
 */
function decodeHtmlEntities(text: string): string {
  if (!text) return '';
  
  let decoded = text;
  
  for (const [entity, char] of Object.entries(HTML_ENTITIES)) {
    decoded = decoded.split(entity).join(char);
  }
  
  decoded = decoded.replace(/&#(\d+);/g, (_, code) => {
    return String.fromCharCode(parseInt(code, 10));
  });
  
  decoded = decoded.replace(/&#x([0-9a-fA-F]+);/g, (_, code) => {
    return String.fromCharCode(parseInt(code, 16));
  });
  
  return decoded;
}

/**
 * Strip HTML tags from text - aggressive approach
 */
function stripHtmlTags(text: string): string {
  if (!text) return '';
  
  let cleaned = text;
  
  cleaned = cleaned.replace(/<!$$CDATA\[([\s\S]*?)$$\]>/gi, '\$1');
  cleaned = cleaned.replace(/<script[\s\S]*?<\/script>/gi, '');
  cleaned = cleaned.replace(/<style[\s\S]*?<\/style>/gi, '');
  cleaned = cleaned.replace(/<[^>]*>/g, ' ');
  cleaned = cleaned.replace(/<[a-zA-Z][^<]*$/g, '');
  cleaned = cleaned.replace(/^[^>]*>/g, '');
  cleaned = cleaned.replace(/\s+(class|data-[a-z-]+|href|src|id|style)=["'][^"']*["']/gi, '');
  cleaned = cleaned.replace(/\s+(class|data-[a-z-]+|href|src|id|style)=[^\s>]*/gi, '');
  cleaned = cleaned.replace(/https?:\/\/[^\s"'<>]+/g, '');
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
  return cleaned;
}

/**
 * Remove author bylines and timestamps from content
 */
function removeBylines(text: string): string {
  if (!text) return '';
  
  let cleaned = text;
  
  cleaned = cleaned.replace(/\b(Mon|Tue|Wed|Thu|Fri|Sat|Sun),?\s*\d{1,2}\/\d{1,2}\/\d{4}\s*[-–]\s*\d{1,2}:\d{2}/gi, '');
  cleaned = cleaned.replace(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[^\s]*/g, '');
  cleaned = cleaned.replace(/^by\s+[A-Z][a-zA-Z]+(\s+[A-Z][a-zA-Z]+)?\s*/i, '');
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
  return cleaned;
}

/**
 * Check if text is just an author name or very short non-content
 */
function isAuthorOnlyOrTooShort(text: string): boolean {
  if (!text) return true;
  
  const trimmed = text.toLowerCase().trim();
  
  // Too short to be useful
  if (trimmed.length < 20) return true;
  
  // Check against known author patterns
  for (const author of KNOWN_AUTHORS) {
    if (trimmed === author || trimmed.startsWith(author + ' ')) {
      // Check if there's meaningful content after the author name
      const afterAuthor = trimmed.replace(author, '').trim();
      if (afterAuthor.length < 20) return true;
    }
  }
  
  // Pattern: Just 2-3 capitalized words (likely a name)
  const words = text.trim().split(/\s+/);
  if (words.length <= 3) {
    const allCapitalized = words.every(w => /^[A-Z][a-z]+$/.test(w));
    if (allCapitalized) return true;
  }
  
  return false;
}

/**
 * Clean text content from RSS feeds
 */
function cleanRssContent(text: string): string {
  if (!text) return '';
  
  let cleaned = stripHtmlTags(text);
  cleaned = decodeHtmlEntities(cleaned);
  cleaned = removeBylines(cleaned);
  
  cleaned = cleaned.replace(/\s*Read more\s*\u2192?\s*$/i, '');
  cleaned = cleaned.replace(/\s*Continue reading\s*\u2192?\s*$/i, '');
  cleaned = cleaned.replace(/\s*$$\u2026$$\s*$/i, '\u2026');
  cleaned = cleaned.replace(/\s*\.\.\.\s*$/i, '\u2026');
  cleaned = cleaned.replace(/\s*The post .+ appeared first on .+\.?\s*\]?>?\s*$/i, '');
  cleaned = cleaned.replace(/\]\]>\s*$/g, '');
  cleaned = cleaned.replace(/^\s*<!\[CDATA\[/g, '');
  cleaned = cleaned.replace(/\b(addtoany_list|a2a_kit|a2a_kit_size_\d+)\b/gi, '');
  cleaned = cleaned.replace(/\bda\b\s*$/i, '');
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
  return cleaned;
}

/**
 * Clean title text (lighter cleaning)
 */
function cleanTitle(text: string): string {
  if (!text) return '';
  
  let cleaned = decodeHtmlEntities(text);
  cleaned = stripHtmlTags(cleaned);
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
  return cleaned;
}

/**
 * Remove duplicate title from summary
 */
function removeDuplicateTitle(title: string, summary: string): string {
  if (!title || !summary) return summary;
  
  const titleLower = title.toLowerCase().trim();
  const summaryLower = summary.toLowerCase().trim();
  
  if (summaryLower.startsWith(titleLower)) {
    let cleaned = summary.substring(title.length).trim();
    cleaned = cleaned.replace(/^[:\-–—,.\s]+/, '').trim();
    return cleaned || summary;
  }
  
  return summary;
}

/**
 * Generate a fallback summary from the title
 */
function generateFallbackSummary(title: string, source: string): string {
  return `Tap to read the full story from ${source}.`;
}

/**
 * Map database record to app NewsItem type
 */
export function mapRecordToNewsItem(record: NewsRecord): NewsItem {
  const cleanedTitle = cleanTitle(record.title);
  let cleanedSummary = cleanRssContent(record.summary);
  
  // Remove duplicate title from summary
  cleanedSummary = removeDuplicateTitle(cleanedTitle, cleanedSummary);
  
  // If summary is just an author name or too short, use fallback
  if (isAuthorOnlyOrTooShort(cleanedSummary)) {
    // Try to use body content if available
    if (record.content) {
      const cleanedBody = cleanRssContent(record.content);
      if (!isAuthorOnlyOrTooShort(cleanedBody)) {
        // Use first 200 chars of body as summary
        cleanedSummary = cleanedBody.length > 200 
          ? cleanedBody.substring(0, 200).trim() + '\u2026'
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
    body: record.content ? cleanRssContent(record.content) : undefined,
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

/**
 * Map array of records to NewsItems
 */
export function mapRecordsToNewsItems(records: NewsRecord[]): NewsItem[] {
  return records.map(mapRecordToNewsItem);
}

/**
 * Map app NewsItem to database record format (for inserts)
 */
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