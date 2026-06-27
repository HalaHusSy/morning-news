// Morning News Dashboard — front-end logic.
// Loads data/news.json and renders a filterable, topic-grouped view.

const TOPIC_ORDER = ['ai', 'finance', 'science', 'comics', 'manga'];
const TOPIC_COLOR = {
  ai: 'var(--ai)',
  finance: 'var(--finance)',
  science: 'var(--science)',
  comics: 'var(--comics)',
  manga: 'var(--manga)',
};

const state = {
  data: null,
  country: 'all',
  search: '',
};

// ---------- helpers ----------

function thaiDate(d = new Date()) {
  return d.toLocaleDateString('th-TH', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
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

// ---------- filtering ----------

function applyFilters(items) {
  const q = state.search.trim().toLowerCase();
  return items.filter((it) => {
    if (state.country !== 'all' && it.country !== state.country) return false;
    if (q) {
      const hay = `${it.title} ${it.snippet} ${it.source}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

// ---------- rendering ----------

function cardHTML(it) {
  const flag = state.data.countries[it.country]?.flag || '🌐';
  const color = TOPIC_COLOR[it.topic] || 'var(--accent)';
  const time = relativeTime(it.publishedAt);
  const snippet = it.snippet ? `<p class="card-snippet">${esc(it.snippet)}</p>` : '';
  return `
    <a class="card" href="${esc(it.link)}" target="_blank" rel="noopener noreferrer" style="--topic-color:${color}">
      <div class="card-meta">
        <span class="card-flag">${flag}</span>
        <span class="card-source">${esc(it.source)}</span>
        ${time ? `<span class="dot">·</span><span>${time}</span>` : ''}
      </div>
      <h3 class="card-title">${esc(it.title)}</h3>
      ${snippet}
      <div class="card-foot">
        <span class="lang-badge">${esc(it.lang)}</span>
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

function render() {
  const content = document.getElementById('content');
  if (!state.data) return;

  const filtered = applyFilters(state.data.items);

  if (filtered.length === 0) {
    content.innerHTML = `<div class="empty">ไม่พบข่าวที่ตรงกับเงื่อนไข ลองล้างตัวกรองหรือคำค้นหา</div>`;
    return;
  }

  const sections = TOPIC_ORDER
    .map((topic) => [topic, filtered.filter((it) => it.topic === topic)])
    .filter(([, items]) => items.length > 0)
    .map(([topic, items]) => sectionHTML(topic, items))
    .join('');

  content.innerHTML = sections;
}

function renderCountryChips() {
  const wrap = document.getElementById('country-chips');
  const counts = state.data.counts.byCountry;
  const order = ['th', 'cn', 'jp', 'us', 'de', 'global'];
  const total = state.data.items.length;

  const chips = [`<button class="chip active" data-country="all">ทั้งหมด <span class="count">${total}</span></button>`];
  for (const c of order) {
    if (!counts[c]) continue;
    const info = state.data.countries[c];
    chips.push(
      `<button class="chip" data-country="${c}">${info.flag} ${esc(info.label)} <span class="count">${counts[c]}</span></button>`
    );
  }
  wrap.innerHTML = chips.join('');

  wrap.querySelectorAll('.chip').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.country = btn.dataset.country;
      wrap.querySelectorAll('.chip').forEach((b) => b.classList.toggle('active', b === btn));
      render();
    });
  });
}

function updateHeader() {
  const now = new Date();
  document.getElementById('greeting').textContent = greetingFor(now.getHours());
  document.getElementById('today').textContent = thaiDate(now);

  const gen = state.data.generatedAt ? new Date(state.data.generatedAt) : null;
  const updated = gen
    ? gen.toLocaleString('th-TH', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })
    : '—';
  document.getElementById('meta').textContent =
    `${state.data.count} ข่าว · ${state.data.feedsOk}/${state.data.feedsTotal} แหล่งข่าว · อัปเดตล่าสุด ${updated}`;

  const failed = state.data.feedsFailed?.length || 0;
  document.getElementById('footer-meta').textContent =
    failed > 0 ? `${failed} แหล่งข่าวดึงไม่สำเร็จรอบนี้` : 'ดึงข่าวครบทุกแหล่ง';
}

// ---------- boot ----------

async function load() {
  const content = document.getElementById('content');
  try {
    const res = await fetch('./data/news.json?t=' + Date.now());
    if (!res.ok) throw new Error('HTTP ' + res.status);
    state.data = await res.json();
    updateHeader();
    renderCountryChips();
    render();
  } catch (err) {
    content.innerHTML = `
      <div class="empty">
        ยังไม่มีข้อมูลข่าว (${esc(err.message)})<br /><br />
        รันคำสั่งนี้ก่อนเพื่อดึงข่าว:<br />
        <code style="color:var(--accent)">npm run fetch</code>
      </div>`;
  }
}

document.getElementById('search').addEventListener('input', (e) => {
  state.search = e.target.value;
  render();
});
document.getElementById('refresh').addEventListener('click', load);

load();
