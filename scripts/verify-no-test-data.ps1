// scripts/scrape-newsapi.js
const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const NEWSAPI_KEY = process.env.NEWSAPI_KEY || '93b5c1c881e141a4afd3e26f6657a87d';
const URL = `https://newsapi.org/v2/everything?q=South+Africa&language=en&pageSize=100&sortBy=publishedAt&apiKey=${NEWSAPI_KEY}`;

(async () => {
  console.log('Fetching from News API...');
  const res = await fetch(URL);
  const data = await res.json();

  if (data.status !== 'ok') {
    console.error('News API error:', data);
    return;
  }

  let inserted = 0;
  for (const article of data.articles) {
    const sourceId = `newsapi-${article.url}`;
    const { data: existing } = await supabase
      .from('news')
      .select('id')
      .eq('source_id', sourceId)
      .maybeSingle();
    if (existing) continue;

    const { error } = await supabase.from('news').insert({
      title: article.title,
      summary: article.description,
      content: article.content,
      source: article.source.name,
      image_url: article.urlToImage,
      published_at: article.publishedAt,
      url: article.url,
      source_id: sourceId,
      category: 'general',
      severity: 'medium',
    });

    if (!error) inserted++;
  }

  console.log(`News API scrape complete. Inserted ${inserted} new articles.`);
})();