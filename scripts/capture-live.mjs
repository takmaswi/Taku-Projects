// Capture live deployments at a consistent 16:10 viewport.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const targets = [
  { id: 'svika', url: 'https://svika.vercel.app' },
  { id: 'nuvia', url: 'https://nuvia-student-hub.vercel.app' },
  { id: 'best-bud', url: 'https://best-bud.vercel.app' },
];

mkdirSync('capture-src', { recursive: true });
const browser = await chromium.launch();

for (const t of targets) {
  const page = await browser.newPage({
    viewport: { width: 1600, height: 1000 },
    deviceScaleFactor: 1,
  });
  try {
    await page.goto(t.url, { waitUntil: 'networkidle', timeout: 60000 });
  } catch (e) {
    console.log(`${t.id}: networkidle timed out, capturing current state (${e.message.split('\n')[0]})`);
  }
  // settle fonts, lazy images, entrance animations
  await page.waitForTimeout(5000);
  await page.mouse.move(800, 500);
  await page.waitForTimeout(800);
  await page.screenshot({ path: `capture-src/${t.id}.png` });
  console.log(`captured ${t.id}`);
  await page.close();
}

await browser.close();
