// Curated, credible RSS sources for the morning dashboard.
// To add/remove a source, just edit this list and re-run `npm run fetch`.
//
// Fields:
//   name    : display name of the outlet
//   url     : RSS/Atom feed URL
//   topic   : ai | finance | science | comics | manga
//   country : th | cn | jp | us | gb | de | fr | global
//   lang    : en | th | zh | ja | de   (original language of the feed)
//   company : (optional) a company key from companies.js — every item from this
//             feed is tagged with that company (used by the per-company feeds).
//
// Dead/blocked feeds are skipped automatically at fetch time, so it is safe
// to keep a generous list here.

export const TOPICS = {
  ai:      { label: 'AI / Research', emoji: '\u{1F9E0}', blurb: 'AI, LLM, AI avatar, computer vision, AI agents' },
  finance: { label: 'Finance',       emoji: '\u{1F4B9}', blurb: 'Markets, economy, business' },
  science: { label: 'Science / Eng', emoji: '\u{1F52C}', blurb: 'Science & engineering' },
  comics:  { label: 'Marvel / DC',   emoji: '\u{1F9B8}', blurb: 'Comics, superhero films & TV' },
  manga:   { label: 'Manga / Anime', emoji: '\u{1F4D6}', blurb: 'Manga & anime news' },
};

export const COUNTRIES = {
  th:     { label: 'Thailand', flag: '\u{1F1F9}\u{1F1ED}' },
  cn:     { label: 'China',    flag: '\u{1F1E8}\u{1F1F3}' },
  jp:     { label: 'Japan',    flag: '\u{1F1EF}\u{1F1F5}' },
  us:     { label: 'USA',      flag: '\u{1F1FA}\u{1F1F8}' },
  gb:     { label: 'UK',       flag: '\u{1F1EC}\u{1F1E7}' },
  de:     { label: 'Germany',  flag: '\u{1F1E9}\u{1F1EA}' },
  fr:     { label: 'France',   flag: '\u{1F1EB}\u{1F1F7}' },
  global: { label: 'Global',   flag: '\u{1F310}' },
};

// Build a Google News RSS search URL for a query (English edition).
// Used for the per-company watch feeds below.
function googleNews(query) {
  const q = encodeURIComponent(query);
  return `https://news.google.com/rss/search?q=${q}&hl=en-US&gl=US&ceid=US:en`;
}

export const FEEDS = [
  // ---------- AI / Research ----------
  { name: 'arXiv cs.AI (Artificial Intelligence)', url: 'http://export.arxiv.org/rss/cs.AI', topic: 'ai', country: 'global', lang: 'en' },
  { name: 'arXiv cs.CL (Computation & Language / LLM)', url: 'http://export.arxiv.org/rss/cs.CL', topic: 'ai', country: 'global', lang: 'en' },
  { name: 'arXiv cs.CV (Computer Vision)', url: 'http://export.arxiv.org/rss/cs.CV', topic: 'ai', country: 'global', lang: 'en' },
  { name: 'arXiv cs.LG (Machine Learning)', url: 'http://export.arxiv.org/rss/cs.LG', topic: 'ai', country: 'global', lang: 'en' },
  { name: 'arXiv cs.MA (Multi-Agent Systems)', url: 'http://export.arxiv.org/rss/cs.MA', topic: 'ai', country: 'global', lang: 'en' },
  { name: 'MIT Technology Review', url: 'https://www.technologyreview.com/feed/', topic: 'ai', country: 'us', lang: 'en' },
  { name: 'VentureBeat AI', url: 'https://venturebeat.com/category/ai/feed/', topic: 'ai', country: 'us', lang: 'en' },
  { name: 'OpenAI News', url: 'https://openai.com/news/rss.xml', topic: 'ai', country: 'us', lang: 'en' },
  { name: 'Google AI Blog', url: 'https://blog.google/technology/ai/rss/', topic: 'ai', country: 'us', lang: 'en' },
  { name: 'Hugging Face Blog', url: 'https://huggingface.co/blog/feed.xml', topic: 'ai', country: 'global', lang: 'en' },
  { name: 'MarkTechPost', url: 'https://www.marktechpost.com/feed/', topic: 'ai', country: 'us', lang: 'en' },
  { name: 'The Decoder', url: 'https://the-decoder.com/feed/', topic: 'ai', country: 'de', lang: 'en' },

  // ---------- Finance ----------
  { name: 'CNBC Top News', url: 'https://www.cnbc.com/id/100003114/device/rss/rss.html', topic: 'finance', country: 'us', lang: 'en' },
  { name: 'CNBC Finance', url: 'https://www.cnbc.com/id/10000664/device/rss/rss.html', topic: 'finance', country: 'us', lang: 'en' },
  { name: 'MarketWatch Top Stories', url: 'http://feeds.marketwatch.com/marketwatch/topstories/', topic: 'finance', country: 'us', lang: 'en' },
  { name: 'Yahoo Finance', url: 'https://finance.yahoo.com/news/rssindex', topic: 'finance', country: 'us', lang: 'en' },
  { name: 'Bangkok Post Business', url: 'https://www.bangkokpost.com/rss/data/business.xml', topic: 'finance', country: 'th', lang: 'en' },
  { name: 'ประชาชาติธุรกิจ (Prachachat)', url: 'https://www.prachachat.net/feed', topic: 'finance', country: 'th', lang: 'th' },
  { name: 'THE STANDARD', url: 'https://thestandard.co/feed/', topic: 'finance', country: 'th', lang: 'th' },
  { name: 'ไทยรัฐ (Thairath)', url: 'https://www.thairath.co.th/rss/news', topic: 'finance', country: 'th', lang: 'th' },
  { name: 'SCMP Business', url: 'https://www.scmp.com/rss/92/feed', topic: 'finance', country: 'cn', lang: 'en' },
  { name: 'SCMP China Economy', url: 'https://www.scmp.com/rss/318208/feed', topic: 'finance', country: 'cn', lang: 'en' },
  { name: 'China Daily Business', url: 'https://www.chinadaily.com.cn/rss/bizchina_rss.xml', topic: 'finance', country: 'cn', lang: 'en' },
  { name: 'Nikkei Asia', url: 'https://asia.nikkei.com/rss/feed/nar', topic: 'finance', country: 'jp', lang: 'en' },
  { name: 'The Japan Times', url: 'https://www.japantimes.co.jp/feed/', topic: 'finance', country: 'jp', lang: 'en' },
  { name: 'Handelsblatt', url: 'https://www.handelsblatt.com/contentexport/feed/schlagzeilen', topic: 'finance', country: 'de', lang: 'de' },
  { name: 'Der Spiegel – Wirtschaft', url: 'https://www.spiegel.de/wirtschaft/index.rss', topic: 'finance', country: 'de', lang: 'de' },
  { name: 'DIE ZEIT – Wirtschaft', url: 'https://newsfeed.zeit.de/wirtschaft/index', topic: 'finance', country: 'de', lang: 'de' },
  { name: 'tagesschau – Wirtschaft', url: 'https://www.tagesschau.de/wirtschaft/index~rss2.xml', topic: 'finance', country: 'de', lang: 'de' },
  { name: 'DW Business', url: 'https://rss.dw.com/rdf/rss-en-bus', topic: 'finance', country: 'de', lang: 'en' },

  // ---------- Science / Engineering ----------
  { name: 'ScienceDaily (Top Science)', url: 'https://www.sciencedaily.com/rss/top/science.xml', topic: 'science', country: 'global', lang: 'en' },
  { name: 'Phys.org', url: 'https://phys.org/rss-feed/', topic: 'science', country: 'global', lang: 'en' },
  { name: 'Nature', url: 'https://www.nature.com/nature.rss', topic: 'science', country: 'global', lang: 'en' },
  { name: 'IEEE Spectrum', url: 'https://spectrum.ieee.org/feeds/feed.rss', topic: 'science', country: 'us', lang: 'en' },
  { name: 'Quanta Magazine', url: 'https://www.quantamagazine.org/feed/', topic: 'science', country: 'us', lang: 'en' },
  { name: 'Ars Technica Science', url: 'https://arstechnica.com/science/feed/', topic: 'science', country: 'us', lang: 'en' },
  { name: 'heise online', url: 'https://www.heise.de/rss/heise-atom.xml', topic: 'science', country: 'de', lang: 'de' },
  { name: 'Golem.de', url: 'https://rss.golem.de/rss.php?feed=RSS2.0', topic: 'science', country: 'de', lang: 'de' },

  // ---------- Marvel / DC (comics) ----------
  { name: 'CBR (Comic Book Resources)', url: 'https://www.cbr.com/feed/', topic: 'comics', country: 'us', lang: 'en' },
  { name: 'ScreenRant', url: 'https://screenrant.com/feed/', topic: 'comics', country: 'us', lang: 'en' },
  { name: 'ComicBook.com', url: 'https://comicbook.com/feed/', topic: 'comics', country: 'us', lang: 'en' },

  // ---------- Manga / Anime ----------
  { name: 'Anime News Network', url: 'https://www.animenewsnetwork.com/all/rss.xml', topic: 'manga', country: 'jp', lang: 'en' },
  { name: 'コミックナタリー (Comic Natalie)', url: 'https://natalie.mu/comic/feed/news', topic: 'manga', country: 'jp', lang: 'ja' },

  // ---------- Per-company watch (Google News search feeds) ----------
  // Guaranteed daily coverage for the specifically-requested companies, on top of
  // the keyword tagging that runs across every feed above. `company` tags every
  // item; `topic` places them in the matching section.
  { name: 'NVIDIA · ติดตามบริษัท', url: googleNews('NVIDIA AI'),               topic: 'ai',      country: 'us', lang: 'en', company: 'nvidia' },
  { name: 'Anthropic · ติดตามบริษัท', url: googleNews('Anthropic Claude AI'),  topic: 'ai',      country: 'us', lang: 'en', company: 'anthropic' },
  { name: 'OpenAI · ติดตามบริษัท', url: googleNews('OpenAI'),                   topic: 'ai',      country: 'us', lang: 'en', company: 'openai' },
  { name: 'Google DeepMind · ติดตามบริษัท', url: googleNews('Google DeepMind Gemini AI'), topic: 'ai', country: 'us', lang: 'en', company: 'google' },
  { name: 'SpaceX · ติดตามบริษัท', url: googleNews('SpaceX'),                   topic: 'science', country: 'us', lang: 'en', company: 'spacex' },
  { name: 'Alibaba · ติดตามบริษัท', url: googleNews('Alibaba Qwen AI'),         topic: 'finance', country: 'cn', lang: 'en', company: 'alibaba' },
];
