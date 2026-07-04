// Morning News Dashboard — front-end logic.
// Tabs: News (topic-grouped, filterable), Companies (watchlist), LLM Arena,
// Tools (catalog), Hardware (specs + prices + compare).

const TOPIC_ORDER = ['ai', 'finance', 'science', 'comics', 'manga'];
const TOPIC_COLOR = {
  ai: 'var(--ai)',
  finance: 'var(--finance)',
  science: 'var(--science)',
  comics: 'var(--comics)',
  manga: 'var(--manga)',
};
const COUNTRY_ORDER = ['th', 'cn', 'us', 'jp', 'gb', 'de', 'fr', 'global'];
const PRICING = {
  free:     { label: 'ฟรี',        cls: 'free' },
  freemium: { label: 'มีฟรี/เสียเงิน', cls: 'freemium' },
  paid:     { label: 'เสียเงิน',    cls: 'paid' },
  open:     { label: 'โอเพน',       cls: 'open' },
};

const state = {
  data: null,    // news.json
  tools: null,   // tools.json
  models: null,  // models.json
  hw: null,      // hardware.json
  tab: 'news',
  country: 'all',
  company: 'all',
  toolCat: 'all',
  modelTier: 'all',
  hwCat: 'all',
  hwCompare: [],        // keys of items selected for comparison (same category only)
  hwCompareView: false, // true = showing the side-by-side table
  search: '',
};

// ---------- helpers ----------

function thaiDate(d = new Date()) {
  return d.toLocaleDateString('th-TH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function greetingFor(hour) {
  if (hour < 5) return 'ดึกแล้วนะ 🌙';
  if (hour < 11) return 'สวัสดีตอนเช้า ☀️';
  if (hour < 17) return 'สวัสดีตอนบ่าย 🌤️';
  return 'สวัสดีตอนเย็น 🌆';
}

function relativeTime(iso) {
  if (!iso) return '';
  const then = Date.parse(iso);
  if (Number.isNaN(then)) return '';
  const diff = Date.now() - then;
  const min = Math.round(diff / 60000);
  if (min < 1) return 'เมื่อสักครู่';
  if (min < 60) return `${min} นาทีที่แล้ว`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr} ชม.ที่แล้ว`;
  const day = Math.round(hr / 24);
  if (day === 1) return 'เมื่อวาน';
  if (day < 7) return `${day} วันก่อน`;
  return new Date(then).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
}

function esc(s = '') {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

function flagOf(country) {
  return (state.data?.countries || state.tools?.countries || {})[country]?.flag || '🌐';
}

// ---------- news filtering ----------

function applyNewsFilters(items) {
  const q = state.search.trim().toLowerCase();
  return items.filter((it) => {
    if (state.country !== 'all' && it.country !== state.country) return false;
    if (state.company !== 'all' && !(it.companies || []).includes(state.company)) return false;
    if (q) {
      const hay = `${it.title} ${it.translatedTitle || ''} ${it.summary || ''} ${it.snippet} ${it.source}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

// ---------- news rendering ----------

function companyChipsHTML(it) {
  const reg = state.data.companies || {};
  const keys = (it.companies || []).filter((k) => reg[k]).slice(0, 4);
  if (!keys.length) return '';
  const chips = keys.map((k) => {
    const c = reg[k];
    return `<span class="co-chip" data-company="${k}" title="ดูข่าวของ ${esc(c.label)}">${c.emoji} ${esc(c.label)}</span>`;
  }).join('');
  return `<div class="card-companies">${chips}</div>`;
}

function cardHTML(it) {
  const color = TOPIC_COLOR[it.topic] || 'var(--accent)';
  const time = relativeTime(it.publishedAt);
  const hasTh = !!it.translatedTitle;

  const titleMain = hasTh ? it.translatedTitle : it.title;
  const titleOrig = hasTh ? `<p class="card-title-orig">${esc(it.title)}</p>` : '';
  const body = it.summary
    ? `<p class="card-summary">${esc(it.summary)}</p>`
    : (it.snippet ? `<p class="card-snippet">${esc(it.snippet)}</p>` : '');
  const insight = it.insight
    ? `<p class="card-insight"><span aria-hidden="true">💡</span> ${esc(it.insight)}</p>`
    : '';
  const aiBadge = it.summary ? `<span class="ai-badge">AI</span>` : '';

  return `
    <a class="card" href="${esc(it.link)}" target="_blank" rel="noopener noreferrer" style="--topic-color:${color}">
      <div class="card-meta">
        <span class="card-flag">${flagOf(it.country)}</span>
        <span class="card-source">${esc(it.source)}</span>
        ${time ? `<span class="dot">·</span><span>${time}</span>` : ''}
      </div>
      <h3 class="card-title">${esc(titleMain)}</h3>
      ${titleOrig}
      ${body}
      ${insight}
      ${companyChipsHTML(it)}
      <div class="card-foot">
        <span class="lang-badge">${esc(it.lang)}</span>
        ${aiBadge}
        <span class="read-more">อ่านต้นฉบับ ↗</span>
      </div>
    </a>`;
}

function sectionHTML(topicKey, items) {
  const t = state.data.topics[topicKey] || { label: topicKey, emoji: '📰', blurb: '' };
  const cards = items.map(cardHTML).join('');
  return `
    <section class="topic-section" data-topic="${topicKey}">
      <div class="topic-head">
        <span class="t-emoji">${t.emoji}</span>
        <h2>${esc(t.label)}</h2>
        <span class="t-blurb">${esc(t.blurb || '')}</span>
        <span class="t-count">${items.length} ข่าว</span>
      </div>
      <div class="cards">${cards}</div>
    </section>`;
}

function companyBannerHTML() {
  if (state.company === 'all') return '';
  const c = state.data.companies?.[state.company];
  if (!c) return '';
  return `
    <div class="filter-banner">
      <span>กำลังดูข่าวของ <strong>${c.emoji} ${esc(c.label)}</strong></span>
      <button class="banner-clear" id="clear-company">✕ ล้างตัวกรองบริษัท</button>
    </div>`;
}

function renderNews() {
  const content = document.getElementById('content');
  const filtered = applyNewsFilters(state.data.items);
  const banner = companyBannerHTML();

  if (filtered.length === 0) {
    content.innerHTML = banner + `<div class="empty">ไม่พบข่าวที่ตรงกับเงื่อนไข ลองล้างตัวกรองหรือคำค้นหา</div>`;
    return;
  }

  const sections = TOPIC_ORDER
    .map((topic) => [topic, filtered.filter((it) => it.topic === topic)])
    .filter(([, items]) => items.length > 0)
    .map(([topic, items]) => sectionHTML(topic, items))
    .join('');

  content.innerHTML = banner + sections;
}

// ---------- companies rendering ----------

function companyCardHTML(key, info, count, latest) {
  const cat = state.data.companyCategories?.[info.category];
  const catLabel = cat ? `${cat.emoji} ${cat.label}` : info.category;
  const muted = count === 0 ? ' muted' : '';
  const head = latest
    ? `<p class="co-latest" title="${esc(latest.title)}">ล่าสุด: ${esc(latest.translatedTitle || latest.title)}</p>`
    : `<p class="co-latest co-none">ยังไม่มีข่าวรอบนี้ · กำลังจับตา</p>`;
  return `
    <div class="co-card${muted}" data-company="${key}">
      <div class="co-top">
        <span class="co-emoji">${info.emoji}</span>
        <div class="co-id">
          <h3>${esc(info.label)}</h3>
          <span class="co-cat">${esc(catLabel)}</span>
        </div>
        <span class="co-count">${count}</span>
      </div>
      ${head}
      <div class="co-actions">
        <button class="co-view" data-company="${key}"${count === 0 ? ' disabled' : ''}>ดูข่าว →</button>
        <a class="co-site" href="${esc(info.site)}" target="_blank" rel="noopener noreferrer">เว็บไซต์ ↗</a>
      </div>
    </div>`;
}

function renderCompanies() {
  const content = document.getElementById('content');
  const reg = state.data.companies || {};
  const counts = state.data.counts?.byCompany || {};
  const q = state.search.trim().toLowerCase();

  // newest matching article per company, for the "ล่าสุด" preview
  const latestByCompany = {};
  for (const it of state.data.items) {
    for (const k of it.companies || []) {
      if (!latestByCompany[k]) latestByCompany[k] = it; // items are already newest-first
    }
  }

  const entries = Object.entries(reg).filter(([, info]) => {
    if (!q) return true;
    return `${info.label} ${info.category}`.toLowerCase().includes(q);
  });

  const sections = COUNTRY_ORDER.map((country) => {
    const inCountry = entries
      .filter(([, info]) => info.country === country)
      .sort((a, b) => (counts[b[0]] || 0) - (counts[a[0]] || 0));
    if (!inCountry.length) return '';
    const ci = state.data.countries[country] || { label: country, flag: '🌐' };
    const total = inCountry.reduce((s, [k]) => s + (counts[k] || 0), 0);
    const cards = inCountry.map(([k, info]) => companyCardHTML(k, info, counts[k] || 0, latestByCompany[k])).join('');
    return `
      <section class="topic-section">
        <div class="topic-head">
          <span class="t-emoji">${ci.flag}</span>
          <h2>${esc(ci.label)}</h2>
          <span class="t-blurb">${inCountry.length} บริษัทที่จับตา</span>
          <span class="t-count">${total} ข่าว</span>
        </div>
        <div class="co-grid">${cards}</div>
      </section>`;
  }).join('');

  content.innerHTML = sections || `<div class="empty">ไม่พบบริษัทที่ตรงกับคำค้นหา</div>`;
}

// ---------- tools rendering ----------

function toolCardHTML(t) {
  const p = PRICING[t.pricing] || { label: t.pricing || '', cls: '' };
  const tags = (t.tags || []).slice(0, 4).map((x) => `<span class="tool-tag">${esc(x)}</span>`).join('');
  const star = t.featured ? `<span class="tool-star" title="แนะนำ">★</span>` : '';
  return `
    <a class="tool-card${t.featured ? ' featured' : ''}" href="${esc(t.link)}" target="_blank" rel="noopener noreferrer">
      <div class="tool-head">
        <h3>${esc(t.name)} ${star}</h3>
        <span class="price-badge ${p.cls}">${esc(p.label)}</span>
      </div>
      <p class="tool-company">${flagOf(t.country)} ${esc(t.company)}</p>
      <p class="tool-desc">${esc(t.desc)}</p>
      <div class="tool-foot">
        <div class="tool-tags">${tags}</div>
        <span class="read-more">เปิด ↗</span>
      </div>
    </a>`;
}

function renderTools() {
  const content = document.getElementById('content');
  if (!state.tools) {
    content.innerHTML = `<div class="empty">ยังโหลดรายการเครื่องมือไม่ได้<br /><br />รัน <code style="color:var(--accent)">npm run tools</code> เพื่อสร้าง data/tools.json</div>`;
    return;
  }
  const q = state.search.trim().toLowerCase();
  const cats = state.tools.categories || {};
  const order = Object.keys(cats);

  const match = (t) => {
    if (state.toolCat !== 'all' && t.category !== state.toolCat) return false;
    if (!q) return true;
    return `${t.name} ${t.company} ${t.desc} ${(t.tags || []).join(' ')}`.toLowerCase().includes(q);
  };

  const sections = order.map((cat) => {
    const list = state.tools.tools.filter((t) => t.category === cat && match(t));
    if (!list.length) return '';
    const info = cats[cat];
    // featured first, then keep authored order
    list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    const cards = list.map(toolCardHTML).join('');
    return `
      <section class="topic-section">
        <div class="topic-head">
          <span class="t-emoji">${info.emoji}</span>
          <h2>${esc(info.label)}</h2>
          <span class="t-blurb">${esc(info.blurb || '')}</span>
          <span class="t-count">${list.length} ตัว</span>
        </div>
        <div class="cards">${cards}</div>
      </section>`;
  }).join('');

  content.innerHTML = sections || `<div class="empty">ไม่พบเครื่องมือที่ตรงกับเงื่อนไข</div>`;
}

// ---------- hardware rendering ----------

// Brand accent colors for the generated product illustrations.
const HW_BRAND_COLORS = [
  [/nvidia|geforce/i, '#9ade2e'],
  [/amd|radeon|ryzen/i, '#ff5a5a'],
  [/intel/i, '#55a7ff'],
  [/samsung/i, '#6b86ff'],
  [/corsair/i, '#ffd54d'],
  [/g\.?skill/i, '#ff9f43'],
  [/kingston/i, '#ff6371'],
  [/crucial|micron/i, '#33c1ff'],
  [/western digital|wd/i, '#f2a33c'],
  [/alienware|dell/i, '#14c8c8'],
  [/lg/i, '#ff5c8a'],
  [/asus|rog/i, '#ff4d6d'],
  [/gigabyte/i, '#ff8a00'],
  [/aoc/i, '#ff6b6b'],
];

function hwAccent(h) {
  for (const [re, color] of HW_BRAND_COLORS) {
    if (re.test(`${h.brand} ${h.name}`)) return color;
  }
  return '#5fb6ff';
}

// Short label drawn on the illustration (model name without the brand prefix).
function hwShortName(h) {
  return h.name
    .replace(/^(GeForce|Radeon|Ryzen\s+[3579]|Core\s+Ultra\s+[579]|Core|G\.Skill|Corsair|Kingston|Crucial|Samsung|WD Black|Alienware|LG UltraGear|ASUS ROG Swift|Gigabyte|AOC)\s+/i, '')
    .replace(/\s+\d+(\.\d+)?"$/, '');
}

// Per-category SVG product illustration — self-contained, so cards always
// have artwork with zero external requests. An item can override it with a
// real photo via the optional `img` field in src/hardware.js.
function hwSVG(h) {
  const a = hwAccent(h);
  const label = esc(hwShortName(h));
  const open = `<svg viewBox="0 0 240 140" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(h.name)}">`;
  const name = (x, y, size = 12) =>
    `<text x="${x}" y="${y}" fill="${a}" font-family="Inter,system-ui,sans-serif" font-size="${size}" font-weight="700" text-anchor="middle">${label}</text>`;

  if (h.category === 'gpu') {
    const fan = (cx) => `
      <circle cx="${cx}" cy="68" r="23" fill="#0e1116" stroke="#39424f"/>
      <g stroke="#4a5462" stroke-width="3" stroke-linecap="round">
        ${[0, 60, 120, 180, 240, 300].map((deg) =>
          `<line x1="${cx}" y1="68" x2="${cx}" y2="50" transform="rotate(${deg} ${cx} 68)"/>`).join('')}
      </g>
      <circle cx="${cx}" cy="68" r="6" fill="#2a3340" stroke="${a}"/>`;
    return `${open}
      <rect x="10" y="34" width="8" height="72" rx="2" fill="#39424f"/>
      <rect x="22" y="32" width="200" height="76" rx="8" fill="#1f2733" stroke="#39424f"/>
      <rect x="22" y="32" width="200" height="7" rx="3.5" fill="${a}"/>
      ${fan(80)} ${fan(164)}
      <g fill="#c9a227">${[0,1,2,3,4,5,6,7,8,9].map((i) => `<rect x="${46 + i * 12}" y="110" width="8" height="7" rx="1"/>`).join('')}</g>
      ${name(120, 24)}
    </svg>`;
  }
  if (h.category === 'cpu') {
    return `${open}
      <rect x="70" y="22" width="100" height="100" rx="6" fill="#173021" stroke="#39424f"/>
      <g fill="#c9a227" opacity=".7">${[0,1,2,3,4,5,6,7].map((i) => `<circle cx="${79 + i * 12}" cy="30" r="1.6"/><circle cx="${79 + i * 12}" cy="114" r="1.6"/><circle cx="78" cy="${38 + i * 10}" r="1.6"/><circle cx="162" cy="${38 + i * 10}" r="1.6"/>`).join('')}</g>
      <rect x="88" y="40" width="64" height="64" rx="4" fill="#2a3340" stroke="${a}" stroke-width="1.5"/>
      <rect x="96" y="48" width="48" height="48" rx="2" fill="#1f2733"/>
      ${name(120, 76, 11)}
    </svg>`;
  }
  if (h.category === 'ram') {
    return `${open}
      <rect x="30" y="46" width="180" height="44" rx="4" fill="#1f2733" stroke="#39424f"/>
      <rect x="30" y="46" width="180" height="10" rx="4" fill="${a}"/>
      <g fill="#0e1116" stroke="#39424f">${[0,1,2,3,4,5,6,7].map((i) => `<rect x="${38 + i * 21}" y="62" width="15" height="18" rx="1.5"/>`).join('')}</g>
      <g fill="#c9a227">${[...Array(16)].map((_, i) => `<rect x="${36 + i * 10.6}" y="90" width="6.5" height="8" rx="1"/>`).join('')}</g>
      <rect x="118" y="90" width="6" height="10" fill="#0e1116"/>
      ${name(120, 34)}
    </svg>`;
  }
  if (h.category === 'ssd') {
    return `${open}
      <rect x="34" y="52" width="150" height="40" rx="4" fill="#1f2733" stroke="#39424f"/>
      <rect x="184" y="58" width="14" height="28" fill="#c9a227"/>
      <rect x="188" y="66" width="10" height="5" fill="#0e1116"/>
      <rect x="42" y="60" width="52" height="24" rx="2" fill="${a}" opacity=".9"/>
      <g fill="#0e1116" stroke="#39424f">${[0,1].map((i) => `<rect x="${104 + i * 36}" y="60" width="30" height="24" rx="2"/>`).join('')}</g>
      <circle cx="40" cy="72" r="4" fill="#0e1116" stroke="#39424f"/>
      ${name(120, 40)}
    </svg>`;
  }
  // monitor
  return `${open}
    <rect x="30" y="18" width="180" height="92" rx="6" fill="#0e1116" stroke="#39424f"/>
    <rect x="36" y="24" width="168" height="80" rx="3" fill="url(#g-${h.key})"/>
    <defs><linearGradient id="g-${h.key}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${a}" stop-opacity=".85"/>
      <stop offset="1" stop-color="#1f2733"/>
    </linearGradient></defs>
    <rect x="112" y="110" width="16" height="12" fill="#39424f"/>
    <rect x="88" y="122" width="64" height="6" rx="3" fill="#39424f"/>
    ${name(120, 68, 13)}
  </svg>`;
}

function hwImageHTML(h, cls = 'hw-img') {
  if (h.img) {
    return `<div class="${cls}"><img src="${esc(h.img)}" alt="${esc(h.name)}" loading="lazy" /></div>`;
  }
  return `<div class="${cls}">${hwSVG(h)}</div>`;
}

function baht(n) {
  return '฿' + Number(n).toLocaleString('th-TH');
}

function hwSearchUrl(name, suffix) {
  return `https://www.google.com/search?q=${encodeURIComponent(`${name} ${suffix}`)}`;
}

function hwItem(key) {
  return (state.hw?.items || []).find((h) => h.key === key);
}

function hwScoreHTML(score) {
  if (score == null) return '';
  return `<span class="hw-score" title="คะแนนเฉลี่ยจากสื่อรีวิว (curated)">★ ${score.toFixed(1)}</span>`;
}

function hwCardHTML(h) {
  const fields = state.hw.specFields?.[h.category] || [];
  const chips = fields.slice(0, 4)
    .filter((f) => h.specs?.[f.key])
    .map((f) => `<span class="m-spec">${esc(h.specs[f.key])}</span>`)
    .join('');
  const thb = h.price?.thb != null ? `<span class="hw-thb">${baht(h.price.thb)}</span>` : '';
  const usd = h.price?.usd != null ? `<span class="hw-usd">MSRP $${Number(h.price.usd).toLocaleString('en-US')}</span>` : '';
  const star = h.featured ? `<span class="tool-star" title="ตัวเด่นของหมวด">★</span>` : '';
  const selected = state.hwCompare.includes(h.key);
  return `
    <div class="hw-card${h.featured ? ' featured' : ''}${selected ? ' comparing' : ''}" data-hwkey="${h.key}">
      ${hwImageHTML(h)}
      <div class="tool-head">
        <h3>${esc(h.name)} ${star}</h3>
        ${hwScoreHTML(h.score)}
      </div>
      <p class="tool-company">${flagOf(h.country)} ${esc(h.brand)} · ออก ${esc(h.released || '—')}</p>
      <div class="hw-price">${thb}${usd}</div>
      <div class="m-specs">${chips}</div>
      <p class="tool-desc">${esc(h.desc)}</p>
      <div class="hw-actions">
        <button class="hw-cmp-btn${selected ? ' on' : ''}" data-hwcmp="${h.key}">${selected ? '✓ เลือกเทียบแล้ว' : '⚖ เทียบ'}</button>
        <a class="hw-link" href="${esc(hwSearchUrl(h.name, 'review'))}" target="_blank" rel="noopener noreferrer">🔎 รีวิว</a>
        <a class="hw-link" href="${esc(hwSearchUrl(h.name, 'ราคา'))}" target="_blank" rel="noopener noreferrer">🛒 เช็คราคา</a>
        <a class="hw-link" href="${esc(h.link)}" target="_blank" rel="noopener noreferrer">เว็บทางการ ↗</a>
      </div>
    </div>`;
}

function toggleHwCompare(key) {
  const item = hwItem(key);
  if (!item) return;
  const i = state.hwCompare.indexOf(key);
  if (i >= 0) {
    state.hwCompare.splice(i, 1);
  } else {
    const first = state.hwCompare.length ? hwItem(state.hwCompare[0]) : null;
    if (first && first.category !== item.category) {
      // comparisons only make sense within a category — start over with the new pick
      state.hwCompare = [key];
    } else if (state.hwCompare.length >= 4) {
      return; // cap at 4 columns so the table stays readable
    } else {
      state.hwCompare.push(key);
    }
  }
  if (state.hwCompare.length < 2) state.hwCompareView = false;
  renderActive();
}

function hwCompareBarHTML() {
  if (!state.hwCompare.length || state.hwCompareView) return '';
  const items = state.hwCompare.map(hwItem).filter(Boolean);
  const cat = state.hw.categories?.[items[0]?.category];
  const names = items.map((h) => `<span class="hw-bar-item">${esc(h.name)}</span>`).join('');
  const hint = items.length < 2
    ? '<span class="hw-bar-hint">เลือกอีกอย่างน้อย 1 ชิ้น (หมวดเดียวกัน) เพื่อเปรียบเทียบ</span>'
    : `<button class="hw-go" id="hw-open-compare">เปรียบเทียบ ${items.length} ชิ้น →</button>`;
  return `
    <div class="hw-compare-bar">
      <span class="hw-bar-cat">${cat ? cat.emoji + ' ' + esc(cat.label) : ''}</span>
      ${names}
      ${hint}
      <button class="banner-clear" id="hw-clear-compare">✕ ล้าง</button>
    </div>`;
}

function hwCompareTableHTML() {
  const items = state.hwCompare.map(hwItem).filter(Boolean);
  if (items.length < 2) return '';
  const cat = items[0].category;
  const fields = state.hw.specFields?.[cat] || [];
  const catInfo = state.hw.categories?.[cat] || { label: cat, emoji: '🖥️' };

  const heads = items.map((h) => `
    <th>
      ${hwImageHTML(h, 'hw-img hw-img-sm')}
      ${esc(h.name)}${h.featured ? ' <span class="tool-star">★</span>' : ''}
    </th>`).join('');

  const thbVals = items.map((h) => h.price?.thb).filter((v) => v != null);
  const minThb = thbVals.length ? Math.min(...thbVals) : null;

  const row = (label, cells) => `<tr><th scope="row">${label}</th>${cells}</tr>`;
  const rows = [];
  rows.push(row('ราคาไทย (อ้างอิง)', items.map((h) => {
    if (h.price?.thb == null) return '<td>—</td>';
    const best = minThb != null && h.price.thb === minThb && thbVals.length > 1;
    return `<td class="${best ? 'hw-best' : ''}">${baht(h.price.thb)}${best ? ' <span class="hw-best-tag">ถูกสุด</span>' : ''}</td>`;
  }).join('')));
  rows.push(row('MSRP (USD)', items.map((h) => `<td>${h.price?.usd != null ? '$' + Number(h.price.usd).toLocaleString('en-US') : '—'}</td>`).join('')));
  rows.push(row('คะแนนรีวิวเฉลี่ย', items.map((h) => `<td>${h.score != null ? '★ ' + h.score.toFixed(1) + ' / 10' : '—'}</td>`).join('')));
  rows.push(row('เปิดตัว', items.map((h) => `<td>${esc(h.released || '—')}</td>`).join('')));
  for (const f of fields) {
    rows.push(row(esc(f.label), items.map((h) => `<td>${esc(h.specs?.[f.key] || '—')}</td>`).join('')));
  }
  rows.push(row('ลิงก์', items.map((h) => `
    <td class="hw-cell-links">
      <a href="${esc(hwSearchUrl(h.name, 'review'))}" target="_blank" rel="noopener noreferrer">🔎 รีวิว</a>
      <a href="${esc(hwSearchUrl(h.name, 'ราคา'))}" target="_blank" rel="noopener noreferrer">🛒 ราคา</a>
      <a href="${esc(h.link)}" target="_blank" rel="noopener noreferrer">ทางการ ↗</a>
    </td>`).join('')));

  return `
    <div class="filter-banner">
      <span>เปรียบเทียบ ${catInfo.emoji} <strong>${esc(catInfo.label)}</strong> · ${items.length} ชิ้น</span>
      <button class="banner-clear" id="hw-back">← กลับไปเลือกสินค้า</button>
    </div>
    <div class="hw-table-wrap">
      <table class="hw-table">
        <thead><tr><th></th>${heads}</tr></thead>
        <tbody>${rows.join('')}</tbody>
      </table>
    </div>
    <p class="hw-disclaimer">ราคาเป็นตัวเลขอ้างอิง (MSRP / ราคาไทยโดยประมาณ ณ วันที่อัปเดตข้อมูล) — กด 🛒 เพื่อเช็คราคาจริงวันนี้</p>`;
}

function renderHardware() {
  const content = document.getElementById('content');
  if (!state.hw) {
    content.innerHTML = `<div class="empty">ยังโหลดแคตาล็อกฮาร์ดแวร์ไม่ได้<br /><br />รัน <code style="color:var(--accent)">npm run hardware</code> เพื่อสร้าง data/hardware.json</div>`;
    return;
  }

  if (state.hwCompareView && state.hwCompare.length >= 2) {
    content.innerHTML = hwCompareTableHTML();
    return;
  }

  const q = state.search.trim().toLowerCase();
  const cats = state.hw.categories || {};

  const match = (h) => {
    if (state.hwCat !== 'all' && h.category !== state.hwCat) return false;
    if (!q) return true;
    const specText = Object.values(h.specs || {}).join(' ');
    return `${h.name} ${h.brand} ${h.desc} ${specText}`.toLowerCase().includes(q);
  };

  const intro = `
    <div class="filter-banner">
      <span>สเปค + ราคาอ้างอิง (curated — แก้ได้ใน <code>src/hardware.js</code>) · กด <strong>⚖ เทียบ</strong> 2–4 ชิ้นในหมวดเดียวกันเพื่อดูตารางเปรียบเทียบ</span>
    </div>`;

  const sections = Object.keys(cats).map((cat) => {
    const list = state.hw.items.filter((h) => h.category === cat && match(h));
    if (!list.length) return '';
    const info = cats[cat];
    const cards = list.map(hwCardHTML).join('');
    return `
      <section class="topic-section">
        <div class="topic-head">
          <span class="t-emoji">${info.emoji}</span>
          <h2>${esc(info.label)}</h2>
          <span class="t-blurb">${esc(info.blurb || '')}</span>
          <span class="t-count">${list.length} รุ่น</span>
        </div>
        <div class="cards">${cards}</div>
      </section>`;
  }).join('');

  content.innerHTML =
    intro +
    (sections || `<div class="empty">ไม่พบฮาร์ดแวร์ที่ตรงกับเงื่อนไข</div>`) +
    hwCompareBarHTML();
}

// ---------- LLM Arena rendering ----------

const RELEASE_RE = /\b(launch|launches|launched|launching|release|releases|released|unveil|unveils|unveiled|announce|announces|announced|announcing|introduc(?:e|es|ing)|debut|debuts|rolls out|now available|coming soon|ships|preview)\b/i;
const MODEL_TERM_RE = /\b(model|models|llm|llms|gpt|chatgpt|claude|gemini|llama|qwen|deepseek|grok|mistral|glm|phi|sora|frontier model|language model|reasoning model|open[- ]?weight)\b/i;
const RELEASE_LABS = new Set(['openai', 'anthropic', 'google', 'deepmind', 'xai', 'deepseek', 'alibaba', 'meta', 'microsoft', 'baidu', 'zhipu', 'moonshot', 'sakana', 'alephalpha', 'scb10x']);

// Pick news items that look like "a model was/▶will be released".
function releaseNewsItems(limit = 12) {
  if (!state.data) return [];
  return state.data.items
    .filter((it) => {
      const text = `${it.title} ${it.translatedTitle || ''} ${it.snippet || ''}`;
      if (!RELEASE_RE.test(text)) return false;
      const aboutModel = MODEL_TERM_RE.test(text);
      const fromLab = (it.companies || []).some((c) => RELEASE_LABS.has(c));
      return aboutModel || fromLab;
    })
    .slice(0, limit);
}

function modelCardHTML(m) {
  const reg = state.data?.companies || {};
  const co = m.companyKey && reg[m.companyKey] ? reg[m.companyKey] : null;
  const coEmoji = co ? co.emoji + ' ' : '';
  const accessCls = m.access === 'open' ? 'open' : 'paid';
  const accessLabel = m.access === 'open' ? 'โอเพนเวต' : 'ปิดซอร์ส';
  const rank = m.rank ? `<span class="m-rank">#${m.rank}</span>` : '';
  const isNew = (() => {
    const t = Date.parse(m.released);
    return !Number.isNaN(t) && (Date.now() - t) < 75 * 86400000;
  })();
  const badges = [];
  if (isNew) badges.push('<span class="m-badge new">ใหม่</span>');
  if (m.status === 'suspended') badges.push('<span class="m-badge susp">ถูกระงับ</span>');
  if (m.status === 'upcoming') badges.push('<span class="m-badge soon">กำลังจะมา</span>');
  return `
    <a class="m-card" href="${esc(m.link)}" target="_blank" rel="noopener noreferrer">
      <div class="m-top">
        ${rank}
        <h3>${esc(m.name)}</h3>
        ${badges.join('')}
      </div>
      <p class="m-company">${flagOf(m.country)} ${coEmoji}${esc(m.company)}</p>
      ${m.arena ? `<p class="m-arena">🏆 ${esc(m.arena)}</p>` : ''}
      <p class="m-note">${esc(m.note)}</p>
      <div class="m-specs">
        <span class="m-spec ${accessCls}">${accessLabel}</span>
        <span class="m-spec">📏 ${esc(m.context)}</span>
        <span class="m-spec">${m.modality === 'multimodal' ? '🖼️ มัลติโมดัล' : '📝 ข้อความ'}</span>
        <span class="m-spec">📅 ${esc(m.released)}</span>
      </div>
    </a>`;
}

function renderArena() {
  const content = document.getElementById('content');
  if (!state.models) {
    content.innerHTML = `<div class="empty">ยังโหลดกระดานโมเดลไม่ได้<br /><br />รัน <code style="color:var(--accent)">npm run models</code> เพื่อสร้าง data/models.json</div>`;
    return;
  }
  const q = state.search.trim().toLowerCase();
  const tiers = state.models.tiers || {};
  const arenaUrl = state.models.arenaUrl || 'https://lmarena.ai/leaderboard';

  const match = (m) => {
    if (state.modelTier !== 'all' && m.tier !== state.modelTier) return false;
    if (!q) return true;
    return `${m.name} ${m.company} ${m.note} ${m.arena || ''}`.toLowerCase().includes(q);
  };

  const intro = `
    <div class="filter-banner arena-intro">
      <span>กระดานเปรียบเทียบ LLM ระดับ frontier — ข้อมูล <strong>curated</strong> (แก้ได้ใน <code>src/models.js</code>) · คะแนน Elo สดดูที่ LMArena</span>
      <a class="banner-clear arena-link" href="${esc(arenaUrl)}" target="_blank" rel="noopener noreferrer">🏆 ดูคะแนนสด LMArena ↗</a>
    </div>`;

  const tierSections = Object.keys(tiers).map((tier) => {
    const list = state.models.models
      .filter((m) => m.tier === tier && match(m))
      .sort((a, b) => (a.rank || 99) - (b.rank || 99));
    if (!list.length) return '';
    const info = tiers[tier];
    const cards = list.map(modelCardHTML).join('');
    return `
      <section class="topic-section">
        <div class="topic-head">
          <span class="t-emoji">${info.emoji}</span>
          <h2>${esc(info.label)}</h2>
          <span class="t-blurb">${esc(info.blurb || '')}</span>
          <span class="t-count">${list.length} โมเดล</span>
        </div>
        <div class="m-grid">${cards}</div>
      </section>`;
  }).join('');

  // Auto release news (only when not filtering/searching, to keep it focused)
  let newsSection = '';
  if (state.modelTier === 'all' && !q) {
    const rel = releaseNewsItems(12);
    if (rel.length) {
      newsSection = `
        <section class="topic-section">
          <div class="topic-head">
            <span class="t-emoji">📰</span>
            <h2>ข่าวเปิดตัว / เตรียมปล่อยโมเดล</h2>
            <span class="t-blurb">ดึงอัตโนมัติจากข่าววันนี้</span>
            <span class="t-count">${rel.length} ข่าว</span>
          </div>
          <div class="cards">${rel.map(cardHTML).join('')}</div>
        </section>`;
    }
  }

  content.innerHTML = intro + (tierSections || `<div class="empty">ไม่พบโมเดลที่ตรงกับคำค้นหา</div>`) + newsSection;
}

// ---------- controls (per-tab filter row) ----------

function chip(active, dataAttr, label, count) {
  const c = count != null ? ` <span class="count">${count}</span>` : '';
  return `<button class="chip${active ? ' active' : ''}" ${dataAttr}>${label}${c}</button>`;
}

function renderControls() {
  const row = document.getElementById('filter-row');
  const search = document.getElementById('search');

  if (state.tab === 'news') {
    const counts = state.data?.counts?.byCountry || {};
    const total = state.data?.items.length || 0;
    const chips = [chip(state.country === 'all', 'data-country="all"', 'ทั้งหมด', total)];
    for (const c of COUNTRY_ORDER) {
      if (!counts[c]) continue;
      const info = state.data.countries[c];
      chips.push(chip(state.country === c, `data-country="${c}"`, `${info.flag} ${esc(info.label)}`, counts[c]));
    }
    row.innerHTML = chips.join('');
    search.placeholder = 'ค้นหาหัวข้อข่าว / แหล่งข่าว…';
  } else if (state.tab === 'companies') {
    row.innerHTML = '';
    search.placeholder = 'ค้นหาบริษัท…';
  } else if (state.tab === 'arena') {
    const tiers = state.models?.tiers || {};
    const chips = [chip(state.modelTier === 'all', 'data-tier="all"', 'ทั้งหมด', state.models?.count)];
    for (const [k, info] of Object.entries(tiers)) {
      chips.push(chip(state.modelTier === k, `data-tier="${k}"`, `${info.emoji} ${esc(info.label)}`, state.models?.counts?.byTier?.[k]));
    }
    row.innerHTML = chips.join('');
    search.placeholder = 'ค้นหาโมเดล…';
  } else if (state.tab === 'hardware') {
    const cats = state.hw?.categories || {};
    const chips = [chip(state.hwCat === 'all', 'data-hwcat="all"', 'ทั้งหมด', state.hw?.count)];
    for (const [k, info] of Object.entries(cats)) {
      chips.push(chip(state.hwCat === k, `data-hwcat="${k}"`, `${info.emoji} ${esc(info.label)}`, state.hw?.counts?.byCategory?.[k]));
    }
    row.innerHTML = chips.join('');
    search.placeholder = 'ค้นหาการ์ดจอ / CPU / สเปค…';
  } else {
    const cats = state.tools?.categories || {};
    const chips = [chip(state.toolCat === 'all', 'data-toolcat="all"', 'ทั้งหมด', state.tools?.count)];
    for (const [k, info] of Object.entries(cats)) {
      chips.push(chip(state.toolCat === k, `data-toolcat="${k}"`, `${info.emoji} ${esc(info.label)}`, state.tools?.counts?.byCategory?.[k]));
    }
    row.innerHTML = chips.join('');
    search.placeholder = 'ค้นหาเครื่องมือ…';
  }
}

// ---------- router ----------

function renderActive() {
  renderControls();
  if (state.tab === 'news') renderNews();
  else if (state.tab === 'companies') renderCompanies();
  else if (state.tab === 'arena') renderArena();
  else if (state.tab === 'hardware') renderHardware();
  else renderTools();
}

function setTab(tab) {
  if (state.tab === tab) return;
  state.tab = tab;
  state.search = '';
  document.getElementById('search').value = '';
  document.querySelectorAll('.tab').forEach((b) => b.classList.toggle('active', b.dataset.tab === tab));
  window.scrollTo({ top: 0, behavior: 'smooth' });
  renderActive();
}

function viewCompanyNews(key) {
  state.company = key;
  state.country = 'all';
  setTab('news');
  if (state.tab === 'news') renderActive(); // ensure re-render if already on news
}

// ---------- header ----------

function updateHeader() {
  const now = new Date();
  document.getElementById('greeting').textContent = greetingFor(now.getHours());
  document.getElementById('today').textContent = thaiDate(now);

  const gen = state.data.generatedAt ? new Date(state.data.generatedAt) : null;
  const updated = gen
    ? gen.toLocaleString('th-TH', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })
    : '—';
  const coTracked = Object.keys(state.data.companies || {}).length;
  document.getElementById('meta').textContent =
    `${state.data.count} ข่าว · ${state.data.feedsOk}/${state.data.feedsTotal} แหล่งข่าว · จับตา ${coTracked} บริษัท · อัปเดต ${updated}`;

  const failed = state.data.feedsFailed?.length || 0;
  document.getElementById('footer-meta').textContent =
    failed > 0 ? `${failed} แหล่งข่าวดึงไม่สำเร็จรอบนี้` : 'ดึงข่าวครบทุกแหล่ง';

  const note = document.getElementById('footer-note');
  if (state.data.aiEnabled) {
    const n = state.data.aiCounts?.enriched || 0;
    note.textContent = `แปล/สรุป/insight ด้วย AI (${state.data.aiModel || 'Gemini'}) · ${n} ข่าว`;
  } else {
    note.textContent = 'ดึงข่าวจากแหล่งข่าวต้นทางโดยตรง · ยังไม่เปิด AI สรุป/แปล';
  }
}

// ---------- boot ----------

async function load() {
  const content = document.getElementById('content');
  content.innerHTML = `<div class="loading">กำลังโหลด…</div>`;
  try {
    const [newsRes, toolsRes, modelsRes, hwRes] = await Promise.allSettled([
      fetch('./data/news.json?t=' + Date.now()),
      fetch('./data/tools.json?t=' + Date.now()),
      fetch('./data/models.json?t=' + Date.now()),
      fetch('./data/hardware.json?t=' + Date.now()),
    ]);
    if (newsRes.status !== 'fulfilled' || !newsRes.value.ok) throw new Error('โหลดข่าวไม่ได้');
    state.data = await newsRes.value.json();
    if (toolsRes.status === 'fulfilled' && toolsRes.value.ok) {
      state.tools = await toolsRes.value.json();
    }
    if (modelsRes.status === 'fulfilled' && modelsRes.value.ok) {
      state.models = await modelsRes.value.json();
    }
    if (hwRes.status === 'fulfilled' && hwRes.value.ok) {
      state.hw = await hwRes.value.json();
    }
    updateHeader();
    renderActive();
  } catch (err) {
    content.innerHTML = `
      <div class="empty">
        ยังไม่มีข้อมูลข่าว (${esc(err.message)})<br /><br />
        รันคำสั่งนี้ก่อนเพื่อดึงข่าว:<br />
        <code style="color:var(--accent)">npm run fetch</code>
      </div>`;
  }
}

// ---------- events ----------

document.getElementById('tabs').addEventListener('click', (e) => {
  const btn = e.target.closest('.tab');
  if (btn) setTab(btn.dataset.tab);
});

document.getElementById('filter-row').addEventListener('click', (e) => {
  const btn = e.target.closest('.chip');
  if (!btn) return;
  if (btn.dataset.country != null) state.country = btn.dataset.country;
  if (btn.dataset.toolcat != null) state.toolCat = btn.dataset.toolcat;
  if (btn.dataset.tier != null) state.modelTier = btn.dataset.tier;
  if (btn.dataset.hwcat != null) { state.hwCat = btn.dataset.hwcat; state.hwCompareView = false; }
  renderActive();
});

document.getElementById('content').addEventListener('click', (e) => {
  // company chip inside a news card -> filter news by that company
  const coChip = e.target.closest('.co-chip');
  if (coChip) {
    e.preventDefault();
    e.stopPropagation();
    viewCompanyNews(coChip.dataset.company);
    return;
  }
  // "ดูข่าว →" button on the Companies tab
  const view = e.target.closest('.co-view');
  if (view && !view.disabled) {
    e.preventDefault();
    viewCompanyNews(view.dataset.company);
    return;
  }
  // clear company filter banner
  if (e.target.closest('#clear-company')) {
    state.company = 'all';
    renderActive();
    return;
  }
  // hardware: toggle an item in the compare selection
  const cmp = e.target.closest('.hw-cmp-btn');
  if (cmp) {
    toggleHwCompare(cmp.dataset.hwcmp);
    return;
  }
  // hardware: open the side-by-side compare table
  if (e.target.closest('#hw-open-compare')) {
    state.hwCompareView = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    renderActive();
    return;
  }
  // hardware: back from the compare table to the catalog
  if (e.target.closest('#hw-back')) {
    state.hwCompareView = false;
    renderActive();
    return;
  }
  // hardware: clear the compare selection
  if (e.target.closest('#hw-clear-compare')) {
    state.hwCompare = [];
    state.hwCompareView = false;
    renderActive();
  }
});

document.getElementById('search').addEventListener('input', (e) => {
  state.search = e.target.value;
  renderActive();
});
document.getElementById('refresh').addEventListener('click', load);

load();
