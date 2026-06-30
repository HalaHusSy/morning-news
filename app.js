// Morning News Dashboard — front-end logic.
// Three tabs: News (topic-grouped, filterable), Companies (watchlist), Tools (catalog).

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
  tab: 'news',
  country: 'all',
  company: 'all',
  toolCat: 'all',
  modelTier: 'all',
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
    const [newsRes, toolsRes, modelsRes] = await Promise.allSettled([
      fetch('./data/news.json?t=' + Date.now()),
      fetch('./data/tools.json?t=' + Date.now()),
      fetch('./data/models.json?t=' + Date.now()),
    ]);
    if (newsRes.status !== 'fulfilled' || !newsRes.value.ok) throw new Error('โหลดข่าวไม่ได้');
    state.data = await newsRes.value.json();
    if (toolsRes.status === 'fulfilled' && toolsRes.value.ok) {
      state.tools = await toolsRes.value.json();
    }
    if (modelsRes.status === 'fulfilled' && modelsRes.value.ok) {
      state.models = await modelsRes.value.json();
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
  }
});

document.getElementById('search').addEventListener('input', (e) => {
  state.search = e.target.value;
  renderActive();
});
document.getElementById('refresh').addEventListener('click', load);

load();
