// Curated frontier-LLM board for the "🏆 LLM Arena" tab.
// `npm run models` writes this to data/models.json for the front-end.
//
// This is a MANUALLY-maintained snapshot (live Elo scores aren't available via a
// free/stable API, so the tab links out to LMArena for live numbers). Update this
// list when a notable model drops — the "ข่าวเปิดตัวโมเดล" section on the same tab
// pulls release news automatically from the daily news feed, so it stays fresh
// even between edits.
//
// Snapshot reflects ~June 2026 (sourced from public leaderboards: lmarena.ai,
// llm-stats.com, vellum.ai). Edit freely.
//
// Fields:
//   name       : model name
//   company    : maker
//   companyKey : optional — links to a company in companies.js
//   country    : th | cn | jp | us | gb | de | fr | global
//   released   : 'YYYY-MM-DD' or 'YYYY' (approx). Drives the "ใหม่" badge.
//   context    : context window (display string, e.g. '1M')
//   modality   : 'multimodal' | 'text'
//   access     : 'closed' | 'open'   (open = open weights)
//   tier       : 'frontier' | 'open'
//   rank       : optional curated order within frontier (1 = top); null otherwise
//   arena      : optional short note about its LMArena standing (no hard Elo)
//   status     : 'released' | 'suspended' | 'upcoming'
//   note       : short Thai note
//   link       : official page

export const MODEL_TIERS = {
  frontier: { label: 'Frontier (ปิดซอร์ส)', emoji: '\u{1F3C6}', blurb: 'โมเดลแถวหน้าสุด แข่งสูสีบน LMArena' },
  open:     { label: 'โอเพนเวตเด่น',          emoji: '\u{1F513}', blurb: 'น้ำหนักเปิด รันเอง/ปรับแต่งได้' },
};

// Live leaderboard (Elo from real votes) — linked from the tab.
export const ARENA_URL = 'https://lmarena.ai/leaderboard';

export const MODELS = [
  // ---------- Frontier (closed) ----------
  { name: 'Claude Opus 4.8', company: 'Anthropic', companyKey: 'anthropic', country: 'us',
    released: '2026-05-28', context: '1M', modality: 'multimodal', access: 'closed', tier: 'frontier',
    rank: 1, arena: '≈ อันดับ 1 บน LMArena', status: 'released',
    note: 'เด่นงานโค้ด/เอกสารยาว — SWE-bench Verified ~88.6%', link: 'https://www.anthropic.com/claude' },
  { name: 'GPT-5.5 Pro', company: 'OpenAI', companyKey: 'openai', country: 'us',
    released: '2026', context: '1M', modality: 'multimodal', access: 'closed', tier: 'frontier',
    rank: 2, arena: '≈ อันดับ 2 บน LMArena', status: 'released',
    note: 'แข็งงานวิเคราะห์กว้าง + โค้ดระดับท็อป', link: 'https://openai.com' },
  { name: 'Gemini 3.1 Pro', company: 'Google', companyKey: 'google', country: 'us',
    released: '2026', context: '1M', modality: 'multimodal', access: 'closed', tier: 'frontier',
    rank: 3, arena: '≈ อันดับ 3 บน LMArena', status: 'released',
    note: 'มัลติโมดัลครบ (ภาพ/เสียง/วิดีโอ) ARC-AGI-2 ~77%', link: 'https://gemini.google.com' },
  { name: 'GPT-5 Pro', company: 'OpenAI', companyKey: 'openai', country: 'us',
    released: '2025-2026', context: '400K', modality: 'multimodal', access: 'closed', tier: 'frontier',
    rank: 5, arena: 'reasoning ล้วนที่แรงสุด', status: 'released',
    note: 'แรงสุดด้าน reasoning ล้วน แต่ช้า/แพง', link: 'https://openai.com' },
  { name: 'Grok 4.3', company: 'xAI', companyKey: 'xai', country: 'us',
    released: '2026', context: '1M', modality: 'multimodal', access: 'closed', tier: 'frontier',
    rank: 6, arena: 'ลุ้นท็อป 10', status: 'released',
    note: 'โมเดลของ xAI (Elon Musk) เชื่อมข้อมูลเรียลไทม์จาก X', link: 'https://x.ai' },
  { name: 'Claude Fable 5', company: 'Anthropic', companyKey: 'anthropic', country: 'us',
    released: '2026-06-09', context: '1M', modality: 'multimodal', access: 'closed', tier: 'frontier',
    rank: 4, arena: 'เคยขึ้นอันดับ 1 (~1525)', status: 'suspended',
    note: 'เคยนำ LMArena แต่ถูกระงับทั่วโลก 12 มิ.ย. 2026 ภายใต้คำสั่ง export control', link: 'https://www.anthropic.com' },

  // ---------- Open weights ----------
  { name: 'Llama 5', company: 'Meta', companyKey: 'meta', country: 'us',
    released: '2026-04-08', context: '5M', modality: 'multimodal', access: 'open', tier: 'open',
    rank: null, arena: 'โอเพนเวตตะวันตกที่เก่งสุด', status: 'released',
    note: '600B params, context ยาวสุดในตลาด (5M), รันเอง/fine-tune ได้', link: 'https://www.llama.com' },
  { name: 'DeepSeek V4', company: 'DeepSeek', companyKey: 'deepseek', country: 'cn',
    released: '2026', context: '1M', modality: 'text', access: 'open', tier: 'open',
    rank: null, arena: 'คุ้มค่าสุดในกลุ่ม', status: 'released',
    note: 'ราคาถูกมาก เก่ง reasoning/โค้ด มีรุ่นโอเพนให้รันเอง', link: 'https://www.deepseek.com' },
  { name: 'GLM-5.2', company: 'Zhipu AI (Z.ai)', companyKey: 'zhipu', country: 'cn',
    released: '2026-06-13', context: '1M', modality: 'text', access: 'open', tier: 'open',
    rank: null, arena: 'MoE 744B', status: 'released',
    note: 'Mixture-of-Experts 744B, license MIT (ใช้เชิงพาณิชย์ได้อิสระ)', link: 'https://z.ai' },
  { name: 'Qwen3', company: 'Alibaba', companyKey: 'alibaba', country: 'cn',
    released: '2025-2026', context: '256K', modality: 'multimodal', access: 'open', tier: 'open',
    rank: null, arena: 'โอเพนยอดนิยม', status: 'released',
    note: 'ตระกูลโอเพนของ Alibaba เก่งหลายภาษา/โค้ด/ภาพ มีหลายขนาด', link: 'https://qwenlm.github.io' },
  { name: 'Mistral Large', company: 'Mistral AI', companyKey: null, country: 'fr',
    released: '2026', context: '256K', modality: 'text', access: 'open', tier: 'open',
    rank: null, arena: 'ตัวแทนยุโรป', status: 'released',
    note: 'โมเดลเด่นจากฝรั่งเศส มีทั้งโอเพนและเชิงพาณิชย์ น้ำหนักเบา', link: 'https://mistral.ai' },
];
