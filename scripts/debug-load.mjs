import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const pending = new Map();
page.on('request', (r) => {
  if (r.url().includes('/cards/')) pending.set(r.url(), 'pending');
});
page.on('requestfailed', (r) => {
  if (r.url().includes('/cards/')) pending.set(r.url(), 'failed: ' + (r.failure()?.errorText ?? '?'));
});
page.on('response', (r) => {
  if (r.url().includes('/cards/')) pending.set(r.url(), 'response ' + r.status());
});
page.on('console', (m) => console.log('[console]', m.type(), m.text().slice(0, 200)));
await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(9000);
console.log('--- card requests:');
for (const [url, state] of pending) console.log(state, '|', url.split('/').pop());
const pct = await page.evaluate(() => document.querySelector('#preloader-pct')?.textContent ?? 'gone');
console.log('preloader pct:', pct);
await browser.close();
