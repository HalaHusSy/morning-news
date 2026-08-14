// Writes the company watchlist (src/companies.js) to data/companies.json.
//
// Run with:  npm run companies
//
// Why this exists separately from news.json: the watchlist is *what we follow*,
// which is independent of *what was in the news today*. Keeping it in its own
// file means the Companies tab still renders the full watchlist even when
// news.json is stale, partially fetched, or predates company tagging — the
// article counts just show 0 instead of the tab collapsing to an empty page.

import { writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { companiesRegistry, COMPANY_CATEGORIES, COMPANIES } from './companies.js';
import { COUNTRIES } from './feeds.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '..', 'data');
const OUT_FILE = join(OUT_DIR, 'companies.json');

async function main() {
  const byCountry = {};
  for (const c of COMPANIES) byCountry[c.country] = (byCountry[c.country] || 0) + 1;

  const payload = {
    generatedAt: new Date().toISOString(),
    count: COMPANIES.length,
    companies: companiesRegistry(),
    companyCategories: COMPANY_CATEGORIES,
    countries: COUNTRIES,
    counts: { byCountry },
  };

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_FILE, JSON.stringify(payload, null, 2), 'utf8');
  console.log(`Wrote ${COMPANIES.length} companies -> ${OUT_FILE}`);
}

main().catch((err) => {
  console.error('Failed to build companies registry:', err);
  process.exit(1);
});
