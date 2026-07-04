// Writes the curated hardware catalog (src/hardware.js) to data/hardware.json
// so the front-end can fetch it. Static content — re-run only when hardware.js
// changes (new items, price updates).
//
// Run with:  npm run hardware

import { writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { HARDWARE, HW_CATEGORIES, HW_SPEC_FIELDS } from './hardware.js';
import { COUNTRIES } from './feeds.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '..', 'data');
const OUT_FILE = join(OUT_DIR, 'hardware.json');

async function main() {
  const seen = new Set();
  for (const h of HARDWARE) {
    if (seen.has(h.key)) throw new Error(`Duplicate hardware key: ${h.key}`);
    seen.add(h.key);
    if (!HW_CATEGORIES[h.category]) throw new Error(`Unknown category "${h.category}" on ${h.key}`);
  }

  const byCategory = {};
  for (const h of HARDWARE) byCategory[h.category] = (byCategory[h.category] || 0) + 1;

  const payload = {
    generatedAt: new Date().toISOString(),
    count: HARDWARE.length,
    categories: HW_CATEGORIES,
    specFields: HW_SPEC_FIELDS,
    countries: COUNTRIES,
    counts: { byCategory },
    items: HARDWARE,
  };

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_FILE, JSON.stringify(payload, null, 2), 'utf8');
  console.log(`Wrote ${HARDWARE.length} hardware items across ${Object.keys(HW_CATEGORIES).length} categories -> ${OUT_FILE}`);
}

main().catch((err) => {
  console.error('Failed to build hardware catalog:', err);
  process.exit(1);
});
