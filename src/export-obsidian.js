// Export today's AI-summarized news as a single daily note into an Obsidian vault.
//
// Run with:  npm run vault
//
// Config (first one found wins):
//   1. env OBSIDIAN_VAULT  — full path to your vault (or any folder)
//   2. vault.config.json   — { "vaultPath": "...", "subfolder": "Morning News" }
//
// Data source: by default it pulls the live published news.json (which already has
// the cloud AI summaries), so you don't need a local fetch/enrich or an API key.
// Override with env NEWS_SOURCE (a URL or a local file path).

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, isAbsolute } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const DEFAULT_SOURCE = 'https://halahussy.github.io/morning-news/data/news.json';
const TOPIC_ORDER = ['ai', 'finance', 'science', 'comics', 'manga'];

async function resolveConfig() {
  let vaultPath = process.env.OBSIDIAN_VAULT;
  let subfolder = process.env.OBSIDIAN_SUBFOLDER || 'Morning News';
  const cfgPath = join(ROOT, 'vault.config.json');
  if (!vaultPath && existsSync(cfgPath)) {
    const cfg = JSON.parse(await readFile(cfgPath, 'utf8'));
    vaultPath = cfg.vaultPath;
    if (cfg.subfolder) subfolder = cfg.subfolder;
  }
  return { vaultPath, subfolder };
}

async function loadData() {
  const src = process.env.NEWS_SOURCE || DEFAULT_SOURCE;
  if (/^https?:\/\//.test(src)) {
    const res = await fetch(src, { signal: AbortSignal.timeout(20000) });
    if (!res.ok) throw new Error(`fetch ${src} -> HTTP ${res.status}`);
    return res.json();
  }
  const p = isAbsolute(src) ? src : join(ROOT, src);
  return JSON.parse(await readFile(p, 'utf8'));
}

// YYYY-MM-DD in Thailand time, for stable daily filenames
function thaiDateKey(d = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
}
function thaiDateLong(d = new Date()) {
  return new Intl.DateTimeFormat('th-TH', {
    timeZone: 'Asia/Bangkok',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d);
}

// Make a string safe to use inside a markdown [link text](...)
function linkText(s = '') {
  return s.replace(/[\[\]]/g, '').replace(/\s+/g, ' ').trim();
}

function buildNote(data) {
  const dateKey = thaiDateKey();
  const items = (data.items || []).filter((it) => it.summary);

  const flagOf = (c) => data.countries?.[c]?.flag || '🌐';
  const labelOf = (t) => data.topics?.[t]?.label || t;
  const emojiOf = (t) => data.topics?.[t]?.emoji || '📰';

  const lines = [];
  lines.push('---');
  lines.push(`date: ${dateKey}`);
  lines.push('type: news-brief');
  lines.push('tags: [morning-news]');
  lines.push(`articles: ${items.length}`);
  lines.push(`source_total: ${data.count ?? items.length}`);
  if (data.aiModel) lines.push(`ai_model: ${data.aiModel}`);
  lines.push(`generated: ${data.generatedAt || ''}`);
  lines.push('---');
  lines.push('');
  lines.push(`# ☀️ Morning Brief — ${thaiDateLong()}`);
  lines.push('');
  lines.push(`> ${items.length} ข่าวที่ AI สรุปแล้ว · อัปเดต ${data.generatedAt || ''}`);
  lines.push('');

  for (const topic of TOPIC_ORDER) {
    const group = items.filter((it) => it.topic === topic);
    if (!group.length) continue;
    lines.push(`## ${emojiOf(topic)} ${labelOf(topic)} (${group.length})`);
    lines.push('');
    for (const it of group) {
      const title = linkText(it.translatedTitle || it.title);
      lines.push(`### [${title}](${it.link})`);
      const meta = [`\`${it.source}\``, `${flagOf(it.country)} ${it.country}`, `#${topic}`, `#${it.country}`];
      lines.push(meta.join(' · '));
      lines.push('');
      if (it.translatedTitle && it.title) lines.push(`*${linkText(it.title)}*`);
      if (it.summary) lines.push(it.summary);
      if (it.insight) {
        lines.push('');
        lines.push(`> [!tip] insight`);
        lines.push(`> ${it.insight}`);
      }
      lines.push('');
    }
  }

  return { dateKey, count: items.length, body: lines.join('\n') };
}

async function main() {
  const { vaultPath, subfolder } = await resolveConfig();
  if (!vaultPath) {
    console.error(
      'No vault path set.\n' +
        '  Set it one of two ways:\n' +
        '    PowerShell:  $env:OBSIDIAN_VAULT="C:/Users/you/YourVault"; npm run vault\n' +
        '    or create vault.config.json:  { "vaultPath": "C:/Users/you/YourVault", "subfolder": "Morning News" }'
    );
    process.exit(1);
  }

  const data = await loadData();
  const { dateKey, count, body } = buildNote(data);

  if (count === 0) {
    console.log('No AI-summarized articles in the data yet — nothing to export. (Try again once enrichment has run.)');
    return;
  }

  const outDir = join(vaultPath, subfolder);
  await mkdir(outDir, { recursive: true });
  const outFile = join(outDir, `${dateKey} Morning Brief.md`);
  await writeFile(outFile, body, 'utf8');

  console.log(`Wrote ${count} summarized articles ->`);
  console.log(`  ${outFile}`);
}

main().catch((err) => {
  console.error('Export failed:', err.message);
  process.exit(1);
});
