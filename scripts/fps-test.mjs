// Drag FPS test on the real GPU: headed Chromium, continuous drag,
// rAF deltas sampled for ~4 seconds.
import { chromium } from 'playwright';

const url = process.argv[2] ?? 'http://localhost:5173';
const browser = await chromium.launch({ headless: false, args: ['--window-size=1480,980'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(7000);

// start sampling frame deltas in the page
await page.evaluate(() => {
  const w = window;
  w.__frames = [];
  let last = performance.now();
  const tick = (t) => {
    w.__frames.push(t - last);
    last = t;
    if (w.__frames.length < 1200) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
});

// continuous figure-of-eight drag for ~4s
const cx = 720;
const cy = 450;
await page.mouse.move(cx, cy);
await page.mouse.down();
const t0 = Date.now();
let i = 0;
while (Date.now() - t0 < 4000) {
  const a = i * 0.16;
  await page.mouse.move(cx + Math.cos(a) * 260, cy + Math.sin(2 * a) * 130, { steps: 1 });
  await page.waitForTimeout(8);
  i += 1;
}
await page.mouse.up();
await page.waitForTimeout(400);

const stats = await page.evaluate(() => {
  const f = window.__frames.slice(20); // skip warmup
  if (!f.length) return null;
  const sorted = [...f].sort((a, b) => a - b);
  const avg = f.reduce((s, v) => s + v, 0) / f.length;
  const p95 = sorted[Math.floor(sorted.length * 0.95)];
  const p99 = sorted[Math.floor(sorted.length * 0.99)];
  const over20 = f.filter((v) => v > 20).length;
  return {
    samples: f.length,
    avgMs: +avg.toFixed(2),
    avgFps: +(1000 / avg).toFixed(1),
    p95Ms: +p95.toFixed(2),
    p99Ms: +p99.toFixed(2),
    framesOver20ms: over20,
  };
});
console.log(JSON.stringify(stats, null, 2));
await browser.close();
