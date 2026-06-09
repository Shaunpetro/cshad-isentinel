// scripts/scrape-rss-feeds.js
const { createClient } = require('@supabase/supabase-js');
const Parser = require('rss-parser');
const https = require('https');

// Custom parser with User-Agent and longer timeout
const parser = new Parser({
  headers: {
    'User-Agent': 'Mozilla/5.0 (compatible; CSHAD-iSentinel/1.0; +https://cshad-isentinel-news.app)',
    'Accept': 'application/rss+xml, application/xml, text/xml, */*',
  },
  timeout: 30000,
  maxRedirects: 5,                   // increased from 3
  customFields: {
    item: [
      ['media:content', 'mediaContent'],
      ['media:thumbnail', 'mediaThumbnail'],
    ],
  },
});

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const MAX_CONSECUTIVE_FAILURES = 5;
const ARTICLES_PER_FEED = 20;
const DELAY_BETWEEN_FEEDS_MS = 2000;

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Sanitize raw XML before parsing – removes invalid HTML attributes
 * that cause "Attribute without value" errors
 */
function sanitizeXml(xml) {
  // Remove attributes with no value (e.g., <tag attr>)
  return xml.replace(/(\s\w+)(\s*(?=>|[\s/]))/g, '$1=""$2');
}

/**
 * Fetch the feed as text, sanitize, then parse.
 * Falls back to standard parseURL if raw fetch fails.
 */
async function parseFeed(url) {
  // First try the standard parser (works for 90% of feeds)
  try {
    return await parser.parseURL(url);
  } catch (err) {
    // If it's an XML parsing error, try fetching raw and sanitizing
    if (err.message && (err.message.includes('Attribute without value') ||
                        err.message.includes('Unquoted attribute') ||
                        err.message.includes('not recognized as RSS'))) {
      try {
        const raw = await fetchRaw(url);
        const sanitized = sanitizeXml(raw);
        return await parser.parseString(sanitized);
      } catch (secondErr) {
        // Re-throw original error if sanitization also fails
        throw err;
      }
    }
    throw err;
  }
}

function fetchRaw(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: parser.headers }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function extractImage(article) {
  if (article.enclosure?.url) return article.enclosure.url;
  if (article.mediaContent?.$.url) return article.mediaContent.$.url;
  if (article.mediaThumbnail?.$.url) return article.mediaThumbnail.$.url;
  if (article.content) {
    const match = article.content.match(/<img[^>]+src="([^">]+)"/);
    if (match) return match[1];
  }
  return null;
}

async function fetchAndInsertArticles(feed) {
  try {
    const result = await parseFeed(feed.url);
    const articles = (result.items || []).slice(0, ARTICLES_PER_FEED);

    let insertedCount = 0;
    for (const article of articles) {
      const guid = article.guid || article.link;
      if (!guid) continue;

      const { data: existing } = await supabase
        .from('news')
        .select('id')
        .eq('rss_guid', guid)
        .maybeSingle();
      if (existing) continue;

      const imageUrl = extractImage(article);

      const { error } = await supabase.from('news').insert({
        title: article.title,
        summary: article.summary || article.contentSnippet,
        content: article.content,
        source: feed.name,
        source_url: article.link,
        image_url: imageUrl,
        published_at: article.isoDate || article.pubDate,
        rss_guid: guid,
        category: feed.category,
        severity: 'medium',
        source_type: 'rss',
        feed_id: feed.id,
      });

      if (!error) insertedCount++;
    }

    await supabase.from('rss_feeds').update({
      last_success_at: new Date().toISOString(),
      consecutive_failures: 0,
      articles_fetched_total: (feed.articles_fetched_total || 0) + insertedCount,
      needs_verification: false,
    }).eq('id', feed.id);

    return { success: true, inserted: insertedCount };
  } catch (err) {
    const failures = (feed.consecutive_failures || 0) + 1;
    await supabase.from('rss_feeds').update({
      consecutive_failures: failures,
      last_error: (err.message || '').substring(0, 500),
      is_active: failures < MAX_CONSECUTIVE_FAILURES,
    }).eq('id', feed.id);

    return { success: false, error: err.message };
  }
}

(async () => {
  console.log('Starting RSS feed ingestion…');

  const { data: feeds, error } = await supabase
    .from('rss_feeds')
    .select('*')
    .eq('is_active', true)
    .order('priority', { ascending: false });

  if (error) {
    console.error('Error fetching feeds:', error.message);
    return;
  }

  console.log(`Processing ${feeds.length} active feeds…`);

  let totalInserted = 0;
  let successCount = 0;
  let failCount = 0;

  for (const feed of feeds) {
    const result = await fetchAndInsertArticles(feed);
    if (result.success) {
      successCount++;
      totalInserted += result.inserted;
      console.log(`✅ ${feed.name} — ${result.inserted} articles`);
    } else {
      failCount++;
      console.log(`❌ ${feed.name} — ${(result.error || '').substring(0, 100)}`);
    }
    await wait(DELAY_BETWEEN_FEEDS_MS);
  }

  console.log(`\nRSS ingestion complete.`);
  console.log(`  ✅ ${successCount} feeds succeeded | ❌ ${failCount} feeds failed`);
  console.log(`  📰 ${totalInserted} new articles inserted`);
})();