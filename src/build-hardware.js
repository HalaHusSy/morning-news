// Writes the curated hardware catalog (src/hardware.js) to data/hardware.json
// so the front-end can fetch it. Static content — re-run only when hardware.js
// changes (new items, price updates).
//
// Run with:  npm run hardware

import { writeFile, mkdir, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import * as si from 'simple-icons';
import { HARDWARE, HW_CATEGORIES, HW_SPEC_FIELDS } from './hardware.js';
import { COUNTRIES } from './feeds.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '..', 'data');
const OUT_FILE = join(OUT_DIR, 'hardware.json');
const PHOTO_DIR = join(__dirname, '..', 'assets', 'hw');

// Official brand logos (CC0 path data from the simple-icons package), matched
// by brand/name. Brands missing from simple-icons (trademark takedowns:
// G.Skill, Crucial, WD, Gigabyte, AOC) fall back to a text monogram.
const LOGO_BY_BRAND = [
  [/nvidia|geforce/i, si.siNvidia],
  [/amd|radeon|ryzen/i, si.siAmd],
  [/intel/i, si.siIntel],
  [/samsung/i, si.siSamsung],
  [/corsair/i, si.siCorsair],
  [/kingston/i, si.siKingstontechnology],
  [/alienware/i, si.siAlienware],
  [/dell/i, si.siDell],
  [/^lg\b/i, si.siLg],
  [/asus/i, si.siAsus],
];

function logoFor(h) {
  for (const [re, icon] of LOGO_BY_BRAND) {
    if (re.test(`${h.brand} ${h.name}`)) return icon;
  }
  return null;
}

function monogramFor(brand) {
  if (/western digital/i.test(brand)) return 'WD';
  return brand.split(/[\s(]/)[0].toUpperCase();
}

// Real product photos dropped into assets/hw/<key>.<ext> are picked up
// automatically (an explicit `img` URL on the item still wins).
async function localPhotos() {
  let files = [];
  try { files = await readdir(PHOTO_DIR); } catch { return {}; }
  const byKey = {};
  for (const f of files) {
    const m = f.match(/^(.+)\.(png|jpe?g|webp|avif|svg)$/i);
    if (m) byKey[m[1]] = `assets/hw/${f}`;
  }
  return byKey;
}

async function main() {
  const seen = new Set();
  for (const h of HARDWARE) {
    if (seen.has(h.key)) throw new Error(`Duplicate hardware key: ${h.key}`);
    seen.add(h.key);
    if (!HW_CATEGORIES[h.category]) throw new Error(`Unknown category "${h.category}" on ${h.key}`);
  }

  const byCategory = {};
  for (const h of HARDWARE) byCategory[h.category] = (byCategory[h.category] || 0) + 1;

  const photos = await localPhotos();
  const logos = {};
  const items = HARDWARE.map((h) => {
    const icon = logoFor(h);
    if (icon) logos[icon.slug] = icon.path;
    return {
      ...h,
      img: h.img || photos[h.key] || undefined,
      logo: icon ? icon.slug : undefined,
      logoText: icon ? undefined : monogramFor(h.brand),
    };
  });
  const photoCount = items.filter((h) => h.img).length;

  const payload = {
    generatedAt: new Date().toISOString(),
    count: HARDWARE.length,
    categories: HW_CATEGORIES,
    specFields: HW_SPEC_FIELDS,
    countries: COUNTRIES,
    counts: { byCategory },
    logos,
    items,
  };

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_FILE, JSON.stringify(payload, null, 2), 'utf8');
  console.log(
    `Wrote ${HARDWARE.length} hardware items across ${Object.keys(HW_CATEGORIES).length} categories ` +
    `(${photoCount} with real photos, ${Object.keys(logos).length} brand logos) -> ${OUT_FILE}`,
  );
}

main().catch((err) => {
  console.error('Failed to build hardware catalog:', err);
  process.exit(1);
});
