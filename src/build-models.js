// Writes the curated LLM board (src/models.js) to data/models.json so the
// front-end can fetch it. Static content — re-run only when models.js changes.
//
// Run with:  npm run models

import { writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { MODELS, MODEL_TIERS, ARENA_URL } from './models.js';
import { COUNTRIES } from './feeds.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '..', 'data');
const OUT_FILE = join(OUT_DIR, 'models.json');

async function main() {
  const byTier = {};
  for (const m of MODELS) byTier[m.tier] = (byTier[m.tier] || 0) + 1;

  const payload = {
    generatedAt: new Date().toISOString(),
    count: MODELS.length,
    arenaUrl: ARENA_URL,
    tiers: MODEL_TIERS,
    countries: COUNTRIES,
    counts: { byTier },
    models: MODELS,
  };

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_FILE, JSON.stringify(payload, null, 2), 'utf8');
  console.log(`Wrote ${MODELS.length} models across ${Object.keys(MODEL_TIERS).length} tiers -> ${OUT_FILE}`);
}

main().catch((err) => {
  console.error('Failed to build models board:', err);
  process.exit(1);
});
