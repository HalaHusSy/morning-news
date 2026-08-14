// Writes the curated tools catalog (src/tools.js) to data/tools.json so the
// front-end can fetch it. Static content — re-run only when tools.js changes.
//
// Run with:  npm run tools

import { writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { TOOLS, TOOL_CATEGORIES, CATALOG_UPDATED } from './tools.js';
import { COUNTRIES } from './feeds.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '..', 'data');
const OUT_FILE = join(OUT_DIR, 'tools.json');

async function main() {
  const byCategory = {};
  for (const t of TOOLS) byCategory[t.category] = (byCategory[t.category] || 0) + 1;

  const payload = {
    generatedAt: new Date().toISOString(),
    catalogUpdated: CATALOG_UPDATED,
    count: TOOLS.length,
    categories: TOOL_CATEGORIES,
    countries: COUNTRIES,
    counts: { byCategory },
    tools: TOOLS,
  };

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_FILE, JSON.stringify(payload, null, 2), 'utf8');
  console.log(`Wrote ${TOOLS.length} tools across ${Object.keys(TOOL_CATEGORIES).length} categories -> ${OUT_FILE}`);
}

main().catch((err) => {
  console.error('Failed to build tools catalog:', err);
  process.exit(1);
});
