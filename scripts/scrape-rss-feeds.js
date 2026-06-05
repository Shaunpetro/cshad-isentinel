// scripts/scrape-rss-feeds.js
const { createClient } = require('@supabase/supabase-js');
const Parser = require('rss-parser');

// Custom parser with User-Agent and timeout
const parser = new Parser({
  headers: {
    'User-Agent': 'Mozilla/5.0 (compatible; CSHAD-iSentinel/1.0; +https://cshad-isentinel-news.app)',
    'Accept': 'application/rss+xml, application/xml, text/xml, */*',
  },
  timeout: 30000,
  maxRedirects: 3,
});

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const MAX_CONSECUTIVE_FAILURES = 5;
const ARTICLES_PER_FEED = 40;
const DELAY_BETWEEN_FEEDS_MS = 2000;   // be polite to servers

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchAndInsertArticles(feed) {
  try {
    const result = await parser.parseURL(feed.url);
    const articles = (result.items || []).slice(0, ARTICLES_PER_FEED);

    let insertedCount = 0;
    for (const article of articles) {
      const guid = article.guid || article.link;
      if (!guid) continue;

      // Deduplication
      const { data: existing } = await supabase
        .from('news')
        .select('id')
        .eq('rss_guid', guid)
        .maybeSingle();
      if (existing) continue;

      const { error } = await supabase.from('news').insert({
        title: article.title,
        summary: article.summary || article.contentSnippet,
        content: article.content,
        source: feed.name,
        source_url: article.link,
        image_url: article.enclosure?.url || null,
        published_at: article.isoDate || article.pubDate,
        rss_guid: guid,
        category: feed.category,
        severity: 'medium',
        source_type: 'rss',
        feed_id: feed.id,
      });

      if (!error) insertedCount++;
    }

    // Update success
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