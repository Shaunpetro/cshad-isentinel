// scripts/scrape-newsapi.js
globalThis.WebSocket = require('ws');
const { createClient } = require('@supabase/supabase-js');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const NEWSAPI_KEY = process.env.NEWSAPI_KEY || '93b5c1c881e141a4afd3e26f6657a87d';

// Broader search terms for SA coverage
const SEARCH_TERMS = [
  'South Africa',
  'Cape Town',
  'Johannesburg',
  'Durban',
  'Pretoria',
];

const SA_DOMAINS = [
  'news24.com', 'timeslive.co.za', 'dailymaverick.co.za',
  'mg.co.za', 'iol.co.za', 'ewn.co.za', 'sabcnews.com',
  'moneyweb.co.za', 'mybroadband.co.za', 'groundup.org.za',
];

const MAX_PAGES = 2;   // up to 2 pages per search term (200 articles max per term)
const PAGE_SIZE = 100;  // max allowed

async function fetchEverything(query, page = 1) {
  const domainsStr = SA_DOMAINS.join(',');
  const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&domains=${domainsStr}&language=en&pageSize=${PAGE_SIZE}&page=${page}&sortBy=publishedAt&apiKey=${NEWSAPI_KEY}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.status !== 'ok') {
      console.warn(`Everything endpoint error (${query}, page ${page}):`, data.code, data.message);
      return { articles: [], totalResults: 0 };
    }
    return { articles: data.articles || [], totalResults: data.totalResults || 0 };
  } catch (err) {
    console.error(`Network error (${query}, page ${page}):`, err.message);
    return { articles: [], totalResults: 0 };
  }
}

(async () => {
  let allArticles = [];

  // Fetch from everything endpoint for each search term
  for (const term of SEARCH_TERMS) {
    for (let page = 1; page <= MAX_PAGES; page++) {
      const { articles, totalResults } = await fetchEverything(term, page);
      console.log(`Term "${term}" page ${page}: ${articles.length} articles (total: ${totalResults})`);
      allArticles = allArticles.concat(articles);

      // Stop paging if we got fewer than PAGE_SIZE results
      if (articles.length < PAGE_SIZE) break;
    }
  }

  // Deduplicate by URL
  const seen = new Set();
  allArticles = allArticles.filter(article => {
    if (seen.has(article.url)) return false;
    seen.add(article.url);
    return true;
  });

  console.log(`Total unique articles: ${allArticles.length}`);

  if (allArticles.length === 0) {
    console.log('No articles found. Exiting.');
    return;
  }

  let inserted = 0;
  let skipped = 0;

  for (const article of allArticles) {
    const dedupGuid = `newsapi-${article.url}`;

    // Check by rss_guid
    const { data: existingByGuid } = await supabase
      .from('news')
      .select('id')
      .eq('rss_guid', dedupGuid)
      .maybeSingle();
    if (existingByGuid) { skipped++; continue; }

    // Also check by source_url
    const { data: existingByUrl } = await supabase
      .from('news')
      .select('id')
      .eq('source_url', article.url)
      .maybeSingle();
    if (existingByUrl) { skipped++; continue; }

    const { error } = await supabase.from('news').insert({
      title: article.title,
      summary: article.description,
      content: article.content,
      source: article.source.name,
      image_url: article.urlToImage,
      source_url: article.url,
      published_at: article.publishedAt,
      rss_guid: dedupGuid,
      category: 'general',
      severity: 'medium',
      source_type: 'api',
    });

    if (error) {
      console.error(`Insert error for "${article.title}":`, error.message);
    } else {
      inserted++;
    }
  }

  console.log(`News API scrape complete. Inserted ${inserted} new articles, skipped ${skipped} duplicates.`);
})();
