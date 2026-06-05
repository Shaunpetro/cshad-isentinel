// scripts/scrape-newsapi.js
const { createClient } = require('@supabase/supabase-js');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const NEWSAPI_KEY = process.env.NEWSAPI_KEY || '93b5c1c881e141a4afd3e26f6657a87d';

// South African and Africa‑focused sources available on News API
const SA_SOURCES = [
  'news24', 'enca', 'daily-maverick', 'mg-co-za', 'timeslive',
  'iol', 'ewn', 'sabc-news', 'moneyweb', 'techcentral',
  'groundup', 'bbc-news', 'the-conversation-africa',
];

// Backup: domains to search via `everything` endpoint
const SA_DOMAINS = [
  'news24.com', 'timeslive.co.za', 'dailymaverick.co.za',
  'mg.co.za', 'iol.co.za', 'ewn.co.za', 'sabcnews.com',
  'moneyweb.co.za', 'mybroadband.co.za', 'groundup.org.za',
  'bbc.com/news/world/africa', 'theconversation.com/africa',
];

async function fetchFromSources() {
  const sourceList = SA_SOURCES.join(',');
  const url = `https://newsapi.org/v2/top-headlines?sources=${sourceList}&pageSize=100&apiKey=${NEWSAPI_KEY}`;
  
  console.log(`Fetching from News API (top-headlines, sources=SA outlets)...`);
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.status !== 'ok') {
      console.warn('Sources endpoint error:', data.code, data.message);
      return [];
    }
    console.log(`Sources endpoint returned ${data.articles.length} articles.`);
    return data.articles;
  } catch (err) {
    console.error('Network error (sources):', err.message);
    return [];
  }
}

async function fetchFromEverything() {
  const domainsStr = SA_DOMAINS.join(',');
  const url = `https://newsapi.org/v2/everything?domains=${domainsStr}&q=South+Africa&language=en&pageSize=100&sortBy=publishedAt&apiKey=${NEWSAPI_KEY}`;
  
  console.log(`Fetching from News API (everything, domains=SA sites)...`);
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.status !== 'ok') {
      console.warn('Everything endpoint error:', data.code, data.message);
      return [];
    }
    console.log(`Everything endpoint returned ${data.articles.length} articles.`);
    return data.articles;
  } catch (err) {
    console.error('Network error (everything):', err.message);
    return [];
  }
}

(async () => {
  // Try the sources endpoint first
  let articles = await fetchFromSources();

  // If no results, fall back to the everything endpoint
  if (articles.length === 0) {
    articles = await fetchFromEverything();
  }

  if (articles.length === 0) {
    console.log('No articles found from any endpoint. Exiting.');
    return;
  }

  let inserted = 0;
  let skipped = 0;

  for (const article of articles) {
    const dedupGuid = `newsapi-${article.url}`;

    // Check for existing record using rss_guid
    const { data: existing } = await supabase
      .from('news')
      .select('id')
      .eq('rss_guid', dedupGuid)
      .maybeSingle();
    if (existing) {
      skipped++;
      continue;
    }

    const { error } = await supabase.from('news').insert({
      title: article.title,
      summary: article.description,
      content: article.content,
      source: article.source.name,
      image_url: article.urlToImage,
      source_url: article.url,          // ← matches the actual column
      published_at: article.publishedAt,
      rss_guid: dedupGuid,              // ← deduplication key
      category: 'general',
      severity: 'medium',
    });

    if (error) {
      console.error(`Insert error for "${article.title}":`, error.message);
    } else {
      inserted++;
    }
  }

  console.log(`News API scrape complete. Inserted ${inserted} new articles, skipped ${skipped} duplicates.`);
})();