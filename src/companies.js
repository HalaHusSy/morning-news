// Company watchlist for the morning dashboard.
//
// Two ways an article gets tagged with a company (see fetch-news.js):
//   1. keyword match  — the company's `keywords` are searched (whole-word) in the
//      article title + snippet + source, across EVERY feed in feeds.js.
//   2. dedicated feed  — a feed in feeds.js with a `company` field tags all of its
//      items with that company (e.g. the per-company Google News feeds).
//
// To follow a new company: add an entry here (and optionally a dedicated feed in
// feeds.js). To stop following one: delete its entry.
//
// Fields:
//   key      : stable id (used in news.json + the UI)
//   label    : display name
//   country  : th | cn | jp | us | gb | de | global   (the company's home base)
//   category : one of COMPANY_CATEGORIES below
//   emoji    : small visual marker
//   site     : official site (opens from the Companies tab)
//   keywords : whole-word, case-insensitive search terms. Keep them DISTINCTIVE
//              to avoid false positives (boundaries are enforced on a-z0-9).

export const COMPANY_CATEGORIES = {
  chip:       { label: 'ชิป / ฮาร์ดแวร์ AI', emoji: '\u{1F9F1}' },
  lab:        { label: 'แล็บวิจัย / โมเดล AI', emoji: '\u{1F9EA}' },
  bigtech:    { label: 'บิ๊กเทค / คลาวด์', emoji: '\u{2601}\u{FE0F}' },
  space:      { label: 'อวกาศ', emoji: '\u{1F680}' },
  ev:         { label: 'ยานยนต์ / หุ่นยนต์', emoji: '\u{1F916}' },
  enterprise: { label: 'AI องค์กร / อุตสาหกรรม', emoji: '\u{1F3E2}' },
  creative:   { label: 'AI สร้างสื่อ', emoji: '\u{1F3A8}' },
};

export const COMPANIES = [
  // ---------------- USA ----------------
  { key: 'nvidia',     label: 'NVIDIA',            country: 'us', category: 'chip',       emoji: '\u{1F7E9}', site: 'https://www.nvidia.com',         keywords: ['nvidia', 'geforce', 'cuda', 'jensen huang', 'blackwell', 'grace hopper', 'rtx'] },
  { key: 'openai',     label: 'OpenAI',            country: 'us', category: 'lab',        emoji: '\u{1F916}', site: 'https://openai.com',             keywords: ['openai', 'chatgpt', 'gpt-4', 'gpt-5', 'gpt-4o', 'sam altman', 'sora', 'dall-e', 'dall·e'] },
  { key: 'anthropic',  label: 'Anthropic',         country: 'us', category: 'lab',        emoji: '\u{1F4DC}', site: 'https://www.anthropic.com',      keywords: ['anthropic', 'claude'] },
  { key: 'google',     label: 'Google / Alphabet', country: 'us', category: 'bigtech',    emoji: '\u{1F535}', site: 'https://ai.google',              keywords: ['google', 'alphabet', 'gemini', 'sundar pichai', 'waymo'] },
  { key: 'microsoft',  label: 'Microsoft',         country: 'us', category: 'bigtech',    emoji: '\u{1FA9F}', site: 'https://www.microsoft.com/ai',   keywords: ['microsoft', 'copilot', 'satya nadella', 'azure ai', 'azure openai'] },
  { key: 'meta',       label: 'Meta',              country: 'us', category: 'bigtech',    emoji: '\u{267E}\u{FE0F}', site: 'https://ai.meta.com',     keywords: ['meta ai', 'meta platforms', 'facebook ai', 'llama 3', 'llama 4', 'mark zuckerberg', 'metaverse', 'quest 3'] },
  { key: 'amazon',     label: 'Amazon / AWS',      country: 'us', category: 'bigtech',    emoji: '\u{1F4E6}', site: 'https://aws.amazon.com/ai/',     keywords: ['amazon web services', 'aws', 'bedrock', 'andy jassy', 'alexa', 'trainium', 'anthropic bedrock'] },
  { key: 'apple',      label: 'Apple',             country: 'us', category: 'bigtech',    emoji: '\u{1F34E}', site: 'https://www.apple.com',          keywords: ['apple intelligence', 'apple ai', 'siri', 'apple silicon', 'tim cook'] },
  { key: 'xai',        label: 'xAI',               country: 'us', category: 'lab',        emoji: '\u{2716}\u{FE0F}', site: 'https://x.ai',            keywords: ['xai', 'grok'] },
  { key: 'amd',        label: 'AMD',               country: 'us', category: 'chip',       emoji: '\u{1F534}', site: 'https://www.amd.com',            keywords: ['amd', 'radeon', 'lisa su', 'instinct mi300', 'ryzen', 'epyc'] },
  { key: 'intel',      label: 'Intel',             country: 'us', category: 'chip',       emoji: '\u{1F537}', site: 'https://www.intel.com',          keywords: ['intel', 'gaudi', 'xeon', 'pat gelsinger'] },
  { key: 'tesla',      label: 'Tesla',             country: 'us', category: 'ev',         emoji: '\u{1F697}', site: 'https://www.tesla.com',          keywords: ['tesla', 'optimus', 'full self-driving', 'fsd', 'dojo'] },
  { key: 'spacex',     label: 'SpaceX',            country: 'us', category: 'space',      emoji: '\u{1F680}', site: 'https://www.spacex.com',         keywords: ['spacex', 'starship', 'falcon 9', 'starlink', 'raptor engine'] },
  { key: 'perplexity', label: 'Perplexity AI',     country: 'us', category: 'lab',        emoji: '\u{1F50E}', site: 'https://www.perplexity.ai',      keywords: ['perplexity'] },
  { key: 'runway',     label: 'Runway',            country: 'us', category: 'creative',   emoji: '\u{1F3AC}', site: 'https://runwayml.com',           keywords: ['runwayml', 'runway gen-3', 'runway ml'] },

  // ---------------- China ----------------
  { key: 'alibaba',    label: 'Alibaba',           country: 'cn', category: 'bigtech',    emoji: '\u{1F6D2}', site: 'https://www.alibabacloud.com',   keywords: ['alibaba', 'qwen', 'tongyi', 'damo academy', 'jack ma'] },
  { key: 'baidu',      label: 'Baidu',             country: 'cn', category: 'bigtech',    emoji: '\u{1F43E}', site: 'https://www.baidu.com',          keywords: ['baidu', 'ernie bot', 'ernie', 'apollo go'] },
  { key: 'tencent',    label: 'Tencent',           country: 'cn', category: 'bigtech',    emoji: '\u{1F4AC}', site: 'https://www.tencent.com',        keywords: ['tencent', 'hunyuan'] },
  { key: 'bytedance',  label: 'ByteDance',         country: 'cn', category: 'bigtech',    emoji: '\u{1F3B5}', site: 'https://www.bytedance.com',      keywords: ['bytedance', 'doubao', 'cici ai'] },
  { key: 'deepseek',   label: 'DeepSeek',          country: 'cn', category: 'lab',        emoji: '\u{1F40B}', site: 'https://www.deepseek.com',       keywords: ['deepseek'] },
  { key: 'zhipu',      label: 'Zhipu AI',          country: 'cn', category: 'lab',        emoji: '\u{1F9EC}', site: 'https://www.zhipuai.cn',         keywords: ['zhipu', 'glm-4', 'chatglm'] },
  { key: 'moonshot',   label: 'Moonshot AI (Kimi)',country: 'cn', category: 'lab',        emoji: '\u{1F319}', site: 'https://www.moonshot.cn',        keywords: ['moonshot ai', 'kimi'] },
  { key: 'sensetime',  label: 'SenseTime',         country: 'cn', category: 'enterprise', emoji: '\u{1F441}\u{FE0F}', site: 'https://www.sensetime.com', keywords: ['sensetime'] },
  { key: 'huawei',     label: 'Huawei',            country: 'cn', category: 'bigtech',    emoji: '\u{1F338}', site: 'https://www.huawei.com',         keywords: ['huawei', 'ascend', 'pangu model', 'kirin'] },

  // ---------------- Japan ----------------
  { key: 'sakana',     label: 'Sakana AI',         country: 'jp', category: 'lab',        emoji: '\u{1F41F}', site: 'https://sakana.ai',              keywords: ['sakana ai'] },
  { key: 'preferred',  label: 'Preferred Networks',country: 'jp', category: 'lab',        emoji: '\u{1F9E0}', site: 'https://www.preferred.jp',       keywords: ['preferred networks'] },
  { key: 'sony',       label: 'Sony',              country: 'jp', category: 'enterprise', emoji: '\u{1F3AE}', site: 'https://www.sony.com',           keywords: ['sony ai', 'playstation', 'sony group'] },
  { key: 'softbank',   label: 'SoftBank',          country: 'jp', category: 'enterprise', emoji: '\u{1F4F1}', site: 'https://group.softbank',         keywords: ['softbank', 'masayoshi son', 'arm holdings'] },
  { key: 'rinna',      label: 'rinna',             country: 'jp', category: 'lab',        emoji: '\u{1F4A0}', site: 'https://rinna.co.jp',            keywords: ['rinna'] },

  // ---------------- United Kingdom ----------------
  { key: 'deepmind',   label: 'Google DeepMind',   country: 'gb', category: 'lab',        emoji: '\u{1F9E9}', site: 'https://deepmind.google',        keywords: ['deepmind', 'alphafold', 'alphago', 'demis hassabis'] },
  { key: 'stability',  label: 'Stability AI',      country: 'gb', category: 'creative',   emoji: '\u{1F3A8}', site: 'https://stability.ai',           keywords: ['stability ai', 'stable diffusion'] },
  { key: 'synthesia',  label: 'Synthesia',         country: 'gb', category: 'creative',   emoji: '\u{1F3A5}', site: 'https://www.synthesia.io',       keywords: ['synthesia'] },
  { key: 'elevenlabs', label: 'ElevenLabs',        country: 'gb', category: 'creative',   emoji: '\u{1F50A}', site: 'https://elevenlabs.io',          keywords: ['elevenlabs', 'eleven labs'] },
  { key: 'wayve',      label: 'Wayve',             country: 'gb', category: 'ev',         emoji: '\u{1F699}', site: 'https://wayve.ai',               keywords: ['wayve'] },
  { key: 'graphcore',  label: 'Graphcore',         country: 'gb', category: 'chip',       emoji: '\u{1F7E3}', site: 'https://www.graphcore.ai',       keywords: ['graphcore'] },

  // ---------------- Germany ----------------
  { key: 'alephalpha', label: 'Aleph Alpha',       country: 'de', category: 'lab',        emoji: '\u{1F536}', site: 'https://aleph-alpha.com',        keywords: ['aleph alpha'] },
  { key: 'deepl',      label: 'DeepL',             country: 'de', category: 'enterprise', emoji: '\u{1F310}', site: 'https://www.deepl.com',          keywords: ['deepl'] },
  { key: 'blackforest',label: 'Black Forest Labs', country: 'de', category: 'creative',   emoji: '\u{1F332}', site: 'https://blackforestlabs.ai',     keywords: ['black forest labs', 'flux.1', 'flux model'] },
  { key: 'helsing',    label: 'Helsing',           country: 'de', category: 'enterprise', emoji: '\u{1F6E1}\u{FE0F}', site: 'https://helsing.ai',     keywords: ['helsing'] },
  { key: 'sap',        label: 'SAP',               country: 'de', category: 'enterprise', emoji: '\u{1F7E6}', site: 'https://www.sap.com',            keywords: ['sap se', 'sap joule', 'joule ai'] },

  // ---------------- Thailand ----------------
  { key: 'scb10x',     label: 'SCB 10X (Typhoon)', country: 'th', category: 'lab',        emoji: '\u{1F32A}\u{FE0F}', site: 'https://www.scb10x.com', keywords: ['scb 10x', 'scb10x', 'typhoon llm', 'typhoon model', 'opentyphoon'] },
  { key: 'kbtg',       label: 'KBTG (Kasikorn)',   country: 'th', category: 'enterprise', emoji: '\u{1F33E}', site: 'https://www.kbtg.tech',          keywords: ['kbtg', 'kasikorn business'] },
  { key: 'ais',        label: 'AIS',               country: 'th', category: 'enterprise', emoji: '\u{1F49A}', site: 'https://www.ais.th',             keywords: ['advanced info service', 'ais 5g'] },
  { key: 'botnoi',     label: 'Botnoi',            country: 'th', category: 'creative',   emoji: '\u{1F47E}', site: 'https://www.botnoigroup.com',    keywords: ['botnoi'] },
  { key: 'iapp',       label: 'iApp Technology',   country: 'th', category: 'enterprise', emoji: '\u{1F7E0}', site: 'https://iapp.co.th',             keywords: ['iapp technology'] },
  { key: 'visai',      label: 'VISAI',             country: 'th', category: 'enterprise', emoji: '\u{1F4D8}', site: 'https://visai.ai',               keywords: ['visai'] },
  { key: 'amity',      label: 'Amity',             country: 'th', category: 'enterprise', emoji: '\u{1F7E1}', site: 'https://www.amity.co',           keywords: ['amity solutions', 'amity ai'] },
];

// Escape a string for safe use inside a RegExp.
function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Build one matcher per company: a whole-word, case-insensitive regex that
// requires the keyword to be bounded by non-alphanumerics (so "aws" doesn't
// match "draws", and "ernie" doesn't match "modernie..."). Uses lookbehind,
// which Node 20+ supports — this only runs at fetch time (server side).
const MATCHERS = COMPANIES.map((c) => {
  const alt = c.keywords.map(escapeRe).join('|');
  return { key: c.key, re: new RegExp(`(?<![a-z0-9])(?:${alt})(?![a-z0-9])`, 'i') };
});

// Return the list of company keys mentioned in a chunk of text.
export function tagCompanies(text = '') {
  const hay = String(text).toLowerCase();
  const hits = [];
  for (const m of MATCHERS) {
    if (m.re.test(hay)) hits.push(m.key);
  }
  return hits;
}

// Compact {key: {label, country, category, emoji, site}} map for embedding in
// news.json so the front-end can render without importing this module.
export function companiesRegistry() {
  const out = {};
  for (const c of COMPANIES) {
    out[c.key] = { label: c.label, country: c.country, category: c.category, emoji: c.emoji, site: c.site };
  }
  return out;
}
