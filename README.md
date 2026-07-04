# ☀️ Morning News Dashboard

เว็บข่าวส่วนตัวสำหรับเปิดดูทุกเช้า — รวมข่าวจาก **แหล่งข่าวต้นทางที่เชื่อถือได้** ใน
ไทย 🇹🇭 / จีน 🇨🇳 / ญี่ปุ่น 🇯🇵 / สหรัฐฯ 🇺🇸 / เยอรมัน 🇩🇪 ตามหัวข้อที่คุณสนใจ:

| หัวข้อ | ครอบคลุม |
|--------|----------|
| 🧠 AI / Research | AI, LLM, AI avatar, computer vision, AI agents (รวม arXiv) |
| 💹 Finance | ตลาด เศรษฐกิจ ธุรกิจ |
| 🔬 Science / Eng | วิทยาศาสตร์ & วิศวกรรม |
| 🦸 Marvel / DC | คอมิก หนัง/ซีรีส์ซูเปอร์ฮีโร่ |
| 📖 Manga / Anime | ข่าวมังงะ & อนิเมะ |

หน้าเว็บมี 3 แท็บ:

| แท็บ | ทำอะไร |
|------|--------|
| 📰 **ข่าว** | ข่าวจัดกลุ่มตามหัวข้อ กรองตามประเทศ + ค้นหา · แต่ละข่าวติดป้าย "บริษัท" ที่ถูกพูดถึง (กดเพื่อกรอง) |
| 🏢 **บริษัท** | watchlist บริษัท AI รายประเทศ (ไทย/จีน/สหรัฐ/ญี่ปุ่น/อังกฤษ/เยอรมัน) พร้อมจำนวนข่าว + พาดหัวล่าสุด |
| 🏆 **LLM Arena** | กระดานเปรียบเทียบโมเดล LLM ระดับ frontier (curated) + ข่าวเปิดตัวโมเดลอัตโนมัติ + ลิงก์คะแนนสด LMArena |
| 🛠️ **เครื่องมือ** | แคตาล็อกเครื่องมือ AI สำหรับงานพัฒนา/วิจัย (avatar 3D, วิดีโอ, ภาพ, เสียง, 3D, โมเดล/API, dev tools) |
| 🖥️ **ฮาร์ดแวร์** | แคตาล็อกการ์ดจอ / CPU / RAM / SSD / จอมอนิเตอร์ พร้อมสเปค + ราคาอ้างอิง + คะแนนรีวิว · เลือก 2–4 ชิ้นในหมวดเดียวกันเพื่อ**เปรียบเทียบสเปค/ราคาแบบตาราง** + ปุ่มลัดหารีวิว/เช็คราคาจริง |

> **🌐 Live:** https://halahussy.github.io/morning-news/ — อัปเดตอัตโนมัติทุกเช้า 06:00 น. (เวลาไทย)
>
> สถานะปัจจุบัน: **MVP — ดึงข่าว + ลิงก์ต้นฉบับ** (ยังไม่เปิด AI แปล/สรุป)
> โครงสร้างข้อมูลเผื่อช่อง `translatedTitle` / `summary` / `insight` ไว้แล้ว พร้อมเสียบ AI ทีหลัง

---

## วิธีใช้ (รันบนเครื่อง)

ครั้งแรกครั้งเดียว — ติดตั้ง dependency:

```bash
npm install
```

ทุกเช้า (หรือเมื่ออยากได้ข่าวใหม่) ทำ 2 ขั้น:

```bash
npm run fetch     # ดึงข่าวล่าสุดจากทุกแหล่ง -> data/news.json
npm start         # เปิดเว็บที่ http://localhost:3000
```

หรือสั่งทีเดียวจบ:

```bash
npm run dev       # ดึงข่าว + เปิดเว็บ ในคำสั่งเดียว
```

แล้วเปิดเบราว์เซอร์ไปที่ **http://localhost:3000** ☕

> ปุ่ม **↻ รีเฟรช** บนหน้าเว็บจะโหลด `news.json` ล่าสุดซ้ำ (ไม่ได้ดึงข่าวใหม่ —
> การดึงข่าวใหม่ต้องรัน `npm run fetch` อีกครั้ง)

---

## โครงสร้างโปรเจกต์

```
NEWS/
├── src/
│   ├── feeds.js         # รายการแหล่งข่าวทั้งหมด (รวมฟีดติดตามรายบริษัทผ่าน Google News)
│   ├── companies.js     # watchlist บริษัท + คีย์เวิร์ดสำหรับติดป้ายบริษัทให้ข่าว
│   ├── fetch-news.js    # ตัวดึง+รวม+จัดรูปข่าว+ติดป้ายบริษัท -> data/news.json
│   ├── tools.js         # แคตาล็อกเครื่องมือ AI (source of truth)
│   ├── build-tools.js   # เขียน tools.js -> data/tools.json (npm run tools)
│   ├── models.js        # กระดานโมเดล LLM frontier (curated, source of truth)
│   ├── build-models.js  # เขียน models.js -> data/models.json (npm run models)
│   ├── hardware.js      # แคตาล็อกฮาร์ดแวร์ PC (curated, source of truth)
│   ├── build-hardware.js# เขียน hardware.js -> data/hardware.json (npm run hardware)
│   ├── enrich-news.js   # ชั้น AI แปล/สรุป/insight (Gemini)
│   └── export-obsidian.js # ส่งสรุปประจำวันเข้า Obsidian (npm run vault)
├── data/
│   ├── news.json        # ข้อมูลข่าว (สร้างโดย npm run fetch)
│   ├── tools.json       # แคตาล็อกเครื่องมือ (สร้างโดย npm run tools)
│   ├── models.json      # กระดานโมเดล LLM (สร้างโดย npm run models)
│   └── hardware.json    # แคตาล็อกฮาร์ดแวร์ (สร้างโดย npm run hardware)
├── index.html           # หน้าเว็บ (แท็บ ข่าว/บริษัท/LLM Arena/เครื่องมือ)
├── styles.css           # ดีไซน์
├── app.js               # ลอจิกฝั่งหน้าเว็บ (โหลด json, แท็บ, กรอง, แสดงผล)
├── serve.js             # static server เล็ก ๆ (ไม่มี dependency)
└── package.json
```

### เพิ่ม / ลบแหล่งข่าว

แก้ไฟล์ [`src/feeds.js`](src/feeds.js) — เพิ่ม object หนึ่งบรรทัดต่อหนึ่งแหล่ง:

```js
{ name: 'ชื่อสำนักข่าว', url: 'https://.../feed', topic: 'ai', country: 'th', lang: 'th' },
```

- `topic`: `ai` | `finance` | `science` | `comics` | `manga`
- `country`: `th` | `cn` | `jp` | `us` | `gb` | `de` | `fr` | `global`

แหล่งที่ดึงไม่สำเร็จจะถูกข้ามอัตโนมัติและรายงานใน log — ใส่เกินไว้ได้ปลอดภัย

### ติดตามบริษัท (แท็บ 🏢 บริษัท)

แก้ไฟล์ [`src/companies.js`](src/companies.js) — เพิ่มบริษัทที่อยากจับตา:

```js
{ key: 'nvidia', label: 'NVIDIA', country: 'us', category: 'chip', emoji: '🟩',
  site: 'https://www.nvidia.com', keywords: ['nvidia', 'jensen huang', 'blackwell'] },
```

ข่าวจะถูกติดป้ายบริษัทอัตโนมัติเมื่อ `keywords` ปรากฏในพาดหัว/สรุป/แหล่งข่าว
(ทำงานกับ **ทุกแหล่ง**) นอกจากนี้ NVIDIA / Anthropic / OpenAI / Google / SpaceX /
Alibaba ยังมีฟีด Google News เฉพาะตัวใน `feeds.js` (ฟิลด์ `company`) เพื่อให้มีข่าวทุกวัน

### เพิ่ม / ลบเครื่องมือ (แท็บ 🛠️ เครื่องมือ)

แก้ไฟล์ [`src/tools.js`](src/tools.js) แล้วรัน `npm run tools` เพื่อสร้าง `data/tools.json` ใหม่

### เพิ่ม / อัปเดตฮาร์ดแวร์ (แท็บ 🖥️ ฮาร์ดแวร์)

แก้ไฟล์ [`src/hardware.js`](src/hardware.js) แล้วรัน `npm run hardware` เพื่อสร้าง `data/hardware.json` ใหม่

- หมวด: `gpu` | `cpu` | `ram` | `ssd` | `monitor` — ฟิลด์สเปคของแต่ละหมวดกำหนดใน `HW_SPEC_FIELDS`
- `price.usd` = MSRP เปิดตัว, `price.thb` = ราคาไทยโดยประมาณ (ราคาขยับตลอด — เป็นตัวเลข **อ้างอิง**
  ปุ่ม 🛒 บนหน้าเว็บจะพาไปเช็คราคาจริงวันนี้, ปุ่ม 🔎 พาไปหารีวิว)
- `score` = คะแนนเฉลี่ยจากสื่อรีวิวหลัก (ใส่เอง 0–10)
- ฟีเจอร์ **เปรียบเทียบ**: กด ⚖ เทียบ 2–4 ชิ้นในหมวดเดียวกัน → ได้ตารางสเปค/ราคา/คะแนน
  เคียงข้างกัน พร้อมไฮไลต์ตัวที่ราคาถูกสุด

### อัปเดตกระดานโมเดล (แท็บ 🏆 LLM Arena)

กระดานโมเดลเป็นข้อมูล **curated** (เพราะคะแนน Elo สดไม่มี API ฟรีที่เสถียร — แท็บนี้จึงลิงก์
ไปดูคะแนนสดที่ [LMArena](https://lmarena.ai/leaderboard) แทน) เมื่อมีโมเดลใหม่น่าสนใจออกมา
แก้ [`src/models.js`](src/models.js) แล้วรัน `npm run models`

ส่วน **"ข่าวเปิดตัว/เตรียมปล่อยโมเดล"** บนแท็บเดียวกัน ดึงจากฟีดข่าวรายวันอัตโนมัติ
(กรองด้วยคำว่า launch/release/announce + ชื่อโมเดล/แล็บ) จึงสดใหม่เองแม้ไม่ได้แก้ models.js

---

## โรดแมปต่อไป

1. ✅ **ขึ้น online ฟรี (เสร็จแล้ว)** — host บน GitHub Pages + GitHub Actions เป็น cron
   ดึงข่าว `npm run fetch` อัตโนมัติทุกเช้า 06:00 น. (เวลาไทย) แล้ว publish ใหม่
   เปิดจากมือถือ/ที่ไหนก็ได้ที่ https://halahussy.github.io/morning-news/ (ฟรีทั้งหมด)
   — กดดึงเองได้จากแท็บ **Actions → Build & deploy dashboard → Run workflow**
2. **เสียบ AI (Claude API)** — เพิ่มขั้นตอนหลัง fetch: แปลพาดหัวเป็นไทย, สรุปย่อ
   2–3 บรรทัด, และดึง "insight ที่เกี่ยวกับ background ของคุณ" ลงในฟิลด์
   `translatedTitle` / `summary` / `insight` ที่เตรียมไว้แล้ว หน้าเว็บจะแสดงให้เอง
3. **คะแนนความเกี่ยวข้อง** — จัดอันดับข่าวตามความใกล้กับความสนใจของคุณ
