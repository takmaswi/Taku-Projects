// Dev verification helper: screenshot the local site.
// usage: node scripts/snap.mjs <url> <outfile> [width] [height] [waitMs] [actions]
// actions: "drag" performs an inertial drag gesture before the shot
import { chromium } from 'playwright';

const [url = 'http://localhost:5173', out = 'shots/site.png', w = '1440', h = '900', wait = '2500', action = ''] =
  process.argv.slice(2);

const browser = await chromium.launch({
  headless: process.env.HEADED !== '1',
});
const page = await browser.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: 1 });
const errors = [];
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(m.text());
});
page.on('pageerror', (e) => errors.push(String(e)));
await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 }).catch((e) => {
  console.error('goto failed:', e.message);
});
await page.waitForTimeout(+wait);

if (action.startsWith('roundtrip')) {
  const [, hx = String(+w / 2), hy = String(+h / 2)] = action.split(',');
  await page.mouse.move(+hx, +hy, { steps: 6 });
  await page.waitForTimeout(400);
  await page.mouse.click(+hx, +hy);
  await page.waitForTimeout(2800);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(2400);
}

if (action.startsWith('click')) {
  const [, hx = String(+w / 2), hy = String(+h / 2), settle = '2600'] = action.split(',');
  await page.mouse.move(+hx, +hy, { steps: 6 });
  await page.waitForTimeout(400);
  await page.mouse.click(+hx, +hy);
  await page.waitForTimeout(+settle);
}

if (action.startsWith('hover')) {
  const [, hx = String(+w / 2), hy = String(+h / 2)] = action.split(',');
  await page.mouse.move(+hx, +hy, { steps: 6 });
  await page.waitForTimeout(900);
}

if (action === 'drag') {
  const cx = +w / 2;
  const cy = +h / 2;
  await page.mouse.move(cx, cy);
  await page.mouse.down();
  for (let i = 1; i <= 12; i++) {
    await page.mouse.move(cx - i * 28, cy + i * 6, { steps: 1 });
    await page.waitForTimeout(16);
  }
  await page.mouse.up();
  await page.waitForTimeout(900);
}

await page.screenshot({ path: out });
console.log('saved', out);
if (errors.length) {
  console.log('CONSOLE ERRORS:');
  errors.slice(0, 12).forEach((e) => console.log(' -', e.slice(0, 300)));
} else {
  console.log('no console errors');
}
await browser.close();
