// Render every mockup HTML to a PNG in capture-src at 2x, cropping
// phone mockups to a 16:10 window over the device so the app fills
// the card instead of floating in the field.
import { chromium } from 'playwright';
import { readdirSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const PHONE_IDS = new Set([
  'salon-manager',
  'electronics-pos',
  'tuckshop-credit',
  'restaurant-orders',
  'mukando',
  'burial-society',
  'poultry',
  'crop-tracker',
  'livestock',
  'church',
  'taku-dzidza',
]);

// CSS-pixel crop: 1000x625 (16:10) centred on the phone, top-aligned
// so the header and first content cards are what the card shows
const PHONE_CLIP = { x: 300, y: 56, width: 1000, height: 625 };

mkdirSync('capture-src', { recursive: true });
const files = readdirSync('mockups').filter((f) => f.endsWith('.html'));
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 2 });

for (const file of files) {
  const id = file.replace(/\.html$/, '');
  await page.goto(pathToFileURL(resolve('mockups', file)).href);
  await page.waitForTimeout(350);
  const clip = PHONE_IDS.has(id) ? PHONE_CLIP : undefined;
  await page.screenshot({ path: `capture-src/${id}.png`, clip });
  console.log('rendered', id, clip ? '(phone crop)' : '(full frame)');
}

await browser.close();
console.log(`${files.length} mockups rendered`);
