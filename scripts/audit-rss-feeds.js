// scripts/audit-rss-feeds.js
const { createClient } = require('@supabase/supabase-js');
const Parser = require('rss-parser');

const parser = new Parser({
  headers: {
    'User-Agent': 'Mozilla/5.0 (compatible; CSHAD-iSentinel/1.0; +https://cshad-isentinel-news.app)',
    'Accept': 'application/rss+xml, application/xml, text/xml, */*',
  },
  timeout: 15000,
  maxRedirects: 3,
});

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
  console.log('Starting monthly feed audit…');

  // Fetch all disabled feeds
  const { data: feeds, error } = await supabase
    .from('rss_feeds')
    .select('*')
    .eq('is_active', false);

  if (error) {
    console.error('Error fetching feeds:', error.message);
    return;
  }

  console.log(`Auditing ${feeds.length} disabled feeds…`);

  let reactivated = 0;
  let stillDead = 0;

  for (const feed of feeds) {
    try {
      await parser.parseURL(feed.url);
      // Feed is working again — reactivate
      await supabase.from('rss_feeds').update({
        is_active: true,
        consecutive_failures: 0,
        last_error: null,
        last_success_at: new Date().toISOString(),
        needs_verification: false,
      }).eq('id', feed.id);
      reactivated++;
      console.log(`🔄 Reactivated: ${feed.name}`);
    } catch {
      stillDead++;
      console.log(`❌ Still dead: ${feed.name}`);
    }
    await wait(2000);
  }

  console.log(`\nAudit complete.`);
  console.log(`  🔄 ${reactivated} feeds reactivated | ❌ ${stillDead} feeds still dead`);
})();