// AI enrichment: translates each headline to Thai, writes a short Thai summary,
// and a one-line "why this matters to you" insight — using the free Google
// Gemini API. Runs after fetch, before the site is assembled.
//
// Run with:  npm run enrich   (needs env GEMINI_API_KEY)
//
// Safe by design:
//  - No GEMINI_API_KEY  -> logs and exits 0 without changing anything (site still works).
//  - Any API error      -> that batch is skipped, build never fails.
//  - Cross-run cache     -> reuses yesterday's published results so the same article
//                           is never summarized twice (keeps free-tier usage tiny).

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const NEWS_FILE = join(__dirname, '..', 'data', 'news.json');

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL_CANDIDATES = [
  process.env.GEMINI_MODEL,
  'gemini-2.0-flash',
  'gemini-2.5-flash',
  'gemini-1.5-flash',
].filter(Boolean);
const PREV_DATA_URL =
  process.env.SITE_DATA_URL || 'https://halahussy.github.io/morning-news/data/news.json';

const BATCH = 12;                 // articles per API call
const MAX_ENRICH_PER_RUN = 300;   // safety cap on new articles processed per run
const RPM_DELAY_MS = 4500;        // ~13 req/min, under Gemini free-tier 15 RPM

const BACKGROUND =
  'ผู้อ่านเป็นคนไทยสาย tech สนใจ: (1) งานวิจัย AI/LLM, computer vision, AI agents ' +
  '(2) การเงิน/ตลาด (3) วิทยาศาสตร์และวิศวกรรม (4) คอมิก Marvel/DC (5) มังงะ/อนิเมะ';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let workingModel = null;

async function callGemini(model, prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.3,
      responseMimeType: 'application/json',
      responseSchema: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            id: { type: 'STRING' },
            th_title: { type: 'STRING' },
            summary: { type: 'STRING' },
            insight: { type: 'STRING' },
          },
          required: ['id', 'th_title', 'summary', 'insight'],
        },
      },
    },
  };
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': API_KEY },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(40000),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    const err = new Error(`HTTP ${res.status}: ${txt.slice(0, 180)}`);
    err.status = res.status;
    throw err;
  }
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('empty response');
  return JSON.parse(text);
}

function buildPrompt(items) {
  const arr = items.map((it) => ({
    id: it.id,
    title: it.title,
    snippet: (it.snippet || '').slice(0, 400),
    topic: it.topic,
    source: it.source,
  }));
  return `คุณเป็นบรรณาธิการข่าวสองภาษาให้ผู้อ่านคนไทย
${BACKGROUND}

สำหรับข่าวแต่ละชิ้นใน JSON ด้านล่าง สร้าง 3 อย่าง:
- th_title: แปลพาดหัวเป็นภาษาไทยให้กระชับเป็นธรรมชาติ (คงศัพท์เทคนิค/ชื่อเฉพาะ/ชื่อบริษัทเป็นภาษาอังกฤษได้)
- summary: สรุปสาระสำคัญเป็นภาษาไทย 1-2 ประโยค
- insight: 1 ประโยคภาษาไทย บอกว่าทำไมข่าวนี้น่าสนใจหรือเกี่ยวข้องกับ background ของผู้อ่าน (so-what)

ตอบกลับเป็น JSON array ที่มี id ตรงกับ input ทุกชิ้น ห้ามมีข้อความอื่นนอก JSON

ข่าว:
${JSON.stringify(arr)}`;
}

async function enrichBatch(items) {
  const prompt = buildPrompt(items);
  if (workingModel) return callGemini(workingModel, prompt);
  let lastErr;
  for (const m of MODEL_CANDIDATES) {
    try {
      const out = await callGemini(m, prompt);
      workingModel = m;
      console.log(`Using Gemini model: ${m}`);
      return out;
    } catch (e) {
      lastErr = e;
      if (e.status === 404 || e.status === 400) continue; // model unavailable -> try next
      throw e;
    }
  }
  throw lastErr || new Error('no usable model');
}

async function loadPrevCache() {
  const map = new Map();
  try {
    const res = await fetch(PREV_DATA_URL, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) return map;
    const prev = await res.json();
    for (const it of prev.items || []) {
      if (it.summary || it.translatedTitle || it.insight) {
        map.set(it.id, {
          translatedTitle: it.translatedTitle ?? null,
          summary: it.summary ?? null,
          insight: it.insight ?? null,
        });
      }
    }
    if (map.size) console.log(`Reusing ${map.size} enrichments from previous publish.`);
  } catch (e) {
    console.log(`No previous cache (${e.message}); enriching fresh.`);
  }
  return map;
}

async function main() {
  if (!API_KEY) {
    console.log('GEMINI_API_KEY not set — skipping AI enrichment. Site still works; AI fields stay null.');
    return;
  }

  const payload = JSON.parse(await readFile(NEWS_FILE, 'utf8'));
  const items = payload.items || [];

  const cache = await loadPrevCache();
  let fromCache = 0;
  const need = [];
  for (const it of items) {
    const c = cache.get(it.id);
    if (c) {
      it.translatedTitle = c.translatedTitle;
      it.summary = c.summary;
      it.insight = c.insight;
      fromCache++;
    } else {
      need.push(it);
    }
  }
  need.sort((a, b) => (Date.parse(b.publishedAt) || 0) - (Date.parse(a.publishedAt) || 0));
  const todo = need.slice(0, MAX_ENRICH_PER_RUN);

  console.log(
    `Enrich: ${items.length} items | ${fromCache} reused | ${todo.length} to process (of ${need.length} new)`
  );

  let enriched = 0;
  let failed = 0;
  for (let i = 0; i < todo.length; i += BATCH) {
    const batch = todo.slice(i, i + BATCH);
    const n = i / BATCH + 1;
    try {
      const out = await enrichBatch(batch);
      const byId = new Map(out.map((o) => [String(o.id), o]));
      for (const it of batch) {
        const o = byId.get(String(it.id));
        if (o) {
          it.translatedTitle = o.th_title || null;
          it.summary = o.summary || null;
          it.insight = o.insight || null;
          enriched++;
        } else {
          failed++;
        }
      }
      console.log(`  batch ${n}: ok (${batch.length})`);
    } catch (e) {
      failed += batch.length;
      console.log(`  batch ${n}: FAILED ${e.message}`);
      if (e.status === 429) {
        console.log('  quota/rate limit reached — stopping; keeping what we have.');
        break;
      }
      if (e.status === 400 || e.status === 401 || e.status === 403) {
        console.log('  auth/model error — check GEMINI_API_KEY (and GEMINI_MODEL). Stopping.');
        break;
      }
    }
    await sleep(RPM_DELAY_MS);
  }

  const withAi = items.filter((x) => x.summary).length;
  payload.aiEnabled = withAi > 0;
  payload.aiModel = workingModel;
  payload.aiCounts = { enriched: withAi };

  await writeFile(NEWS_FILE, JSON.stringify(payload, null, 2), 'utf8');
  console.log(
    `Done. ${enriched} newly enriched, ${failed} failed, ${fromCache} cached. Total with AI: ${withAi}/${items.length}`
  );
  process.exit(0);
}

main().catch((err) => {
  // Never fail the build because of AI — log and move on.
  console.error('Enrichment error (continuing without it):', err.message);
  process.exit(0);
});
