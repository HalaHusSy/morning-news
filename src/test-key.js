// Quick Gemini API key checker. Safe to share its output (shows only the first
// 6 chars + length of the key, plus the API's error message — never the full key).
//
// Usage (PowerShell):
//   $env:GEMINI_API_KEY="AIza...your key..."
//   node src/test-key.js

const key = process.env.GEMINI_API_KEY;
if (!key) {
  console.log('NO KEY found in env. Run first:  $env:GEMINI_API_KEY="AIza..."');
  process.exit(0);
}
console.log(`Key preview: "${key.slice(0, 6)}…"  | length: ${key.length}  (AIza… = old format, AQ.… = new format — both fine)`);

const models = [process.env.GEMINI_MODEL, 'gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-1.5-flash'].filter(Boolean);

for (const m of models) {
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
        body: JSON.stringify({ contents: [{ parts: [{ text: 'reply with OK' }] }] }),
      }
    );
    const txt = await res.text();
    if (res.ok) {
      console.log(`\n  ${m}: VALID — key works! You can deploy now.`);
      process.exit(0);
    }
    console.log(`  ${m}: HTTP ${res.status} -> ${txt.replace(/\s+/g, ' ').slice(0, 180)}`);
  } catch (e) {
    console.log(`  ${m}: ${e.message}`);
  }
}
console.log('\n  None of the models worked with this key — see the HTTP messages above.');
