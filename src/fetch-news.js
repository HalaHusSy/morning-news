// Fetches every feed in feeds.js, normalizes the items into one schema,
// dedupes, sorts newest-first, and writes data/news.json.
//
// Run with:  npm run fetch
//
// Designed to fail gracefully: a dead/blocked/slow feed is skipped and logged,
// it never aborts the whole run.

import Parser from 'rss-parser';
import { writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { FEEDS, TOPICS, COUNTRIES } from './feeds.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '..', 'data');
const OUT_FILE = join(OUT_DIR, 'news.json');

const ITEMS_PER_FEED = 12;     // cap per source so one chatty feed can't dominate
const FEED_TIMEOUT_MS = 15000; // per-feed network timeout (rss-parser's own)
const HARD_TIMEOUT_MS = 20000; // absolute cap: abandon a feed even if its socket hangs
const CONCURRENCY = 8;         // how many feeds to fetch at once

const parser = new Parser({
  timeout: FEED_TIMEOUT_MS,
  headers: {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) MorningNewsDashboard/0.1 (+personal use)',
    Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*',
  },
});

// --- small helpers -------------------------------------------------------

function stripHtml(s = '') {
  return s
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&hellip;/gi, '…')
    .replace(/\s+/g, ' ')
    .trim();
}

function snippetOf(item) {
  const raw =
    item.contentSnippet ||
    item.summary ||
    item.content ||
    item['content:encoded'] ||
    '';
  const text = stripHtml(raw);
  return text.length > 240 ? text.slice(0, 237).trimEnd() + '…' : text;
}

// Stable short id from the link (djb2 -> base36)
function hashId(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) >>> 0;
  return h.toString(36);
}

function isoDate(item) {
  const d = item.isoDate || item.pubDate || item.date;
  const t = d ? Date.parse(d) : NaN;
  return Number.isNaN(t) ? null : new Date(t).toISOString();
}

// Reject a promise if it doesn't settle within ms — guards against feeds whose
// socket hangs and never triggers rss-parser's own timeout.
function withTimeout(promise, ms, label) {
  let timer;
  const guard = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`hard timeout after ${ms}ms`)), ms);
  });
  return Promise.race([promise, guard]).finally(() => clearTimeout(timer));
}

// Run async tasks with limited concurrency.
async function pool(items, limit, worker) {
  const results = [];
  let i = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (i < items.length) {
      const idx = i++;
      results[idx] = await worker(items[idx], idx);
    }
  });
  await Promise.all(runners);
  return results;
}

// --- per-feed fetch ------------------------------------------------------

async function fetchFeed(feed) {
  try {
    const parsed = await withTimeout(parser.parseURL(feed.url), HARD_TIMEOUT_MS, feed.name);
    const items = (parsed.items || [])
      .slice(0, ITEMS_PER_FEED)
      .map((it) => {
        const link = (it.link || it.guid || '').trim();
        const title = stripHtml(it.title || '').trim();
        if (!link || !title) return null;
        return {
          id: hashId(link),
          title,
          link,
          source: feed.name,
          topic: feed.topic,
          country: feed.country,
          lang: feed.lang,
          publishedAt: isoDate(it),
          snippet: snippetOf(it),
          // Reserved for the future AI layer — kept null for now.
          translatedTitle: null,
          summary: null,
          insight: null,
        };
      })
      .filter(Boolean);
    return { ok: true, feed, items };
  } catch (err) {
    return { ok: false, feed, items: [], error: err.message };
  }
}

// --- main ----------------------------------------------------------------

async function main() {
  const startedAt = Date.now();
  console.log(`Fetching ${FEEDS.length} feeds (concurrency ${CONCURRENCY})…\n`);

  const results = await pool(FEEDS, CONCURRENCY, fetchFeed);

  const okResults = results.filter((r) => r.ok);
  const failResults = results.filter((r) => !r.ok);

  // Merge + dedupe by link
  const byLink = new Map();
  for (const r of okResults) {
    for (const item of r.items) {
      if (!byLink.has(item.link)) byLink.set(item.link, item);
    }
  }
  const items = [...byLink.values()].sort((a, b) => {
    const ta = a.publishedAt ? Date.parse(a.publishedAt) : 0;
    const tb = b.publishedAt ? Date.parse(b.publishedAt) : 0;
    return tb - ta;
  });

  // Per-topic / per-country tallies for the UI
  const byTopic = {};
  const byCountry = {};
  for (const it of items) {
    byTopic[it.topic] = (byTopic[it.topic] || 0) + 1;
    byCountry[it.country] = (byCountry[it.country] || 0) + 1;
  }

  const payload = {
    generatedAt: new Date().toISOString(),
    count: items.length,
    feedsTotal: FEEDS.length,
    feedsOk: okResults.length,
    feedsFailed: failResults.map((r) => ({ name: r.feed.name, url: r.feed.url, error: r.error })),
    topics: TOPICS,
    countries: COUNTRIES,
    counts: { byTopic, byCountry },
    items,
  };

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_FILE, JSON.stringify(payload, null, 2), 'utf8');

  // --- console report ---
  const secs = ((Date.now() - startedAt) / 1000).toFixed(1);
  console.log('Per-feed results:');
  for (const r of results) {
    const mark = r.ok ? `✓ ${String(r.items.length).padStart(2)}` : '✗   ';
    console.log(`  ${mark}  ${r.feed.name}${r.ok ? '' : `  — ${r.error}`}`);
  }
  console.log('');
  console.log(`Done in ${secs}s`);
  console.log(`  ${okResults.length}/${FEEDS.length} feeds ok, ${failResults.length} failed`);
  console.log(`  ${items.length} unique articles -> ${OUT_FILE}`);

  // A hung feed can leave a socket open and keep the event loop alive even though
  // our data is already written — force a clean exit so CI never stalls.
  process.exit(0);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
