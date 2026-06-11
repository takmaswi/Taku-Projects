import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on('console', (m) => {
  if (m.type() === 'error' || m.type() === 'warning') console.log('[' + m.type() + ']', m.text().slice(0, 220));
});
page.on('pageerror', (e) => console.log('[pageerror]', String(e).slice(0, 300)));
await page.goto('http://localhost:5173/#/p/electronics-pos', { waitUntil: 'networkidle' });
await page.waitForTimeout(12000);
await page.screenshot({ path: 'shots/debug-detail.png' });

const state = await page.evaluate(() => {
  const hero = document.querySelector('.detail-hero');
  const slot = document.querySelector('.detail-hero-slot');
  const rail = document.querySelector('.detail-rail');
  const r = (el) => {
    if (!el) return null;
    const b = el.getBoundingClientRect();
    return {
      rect: [Math.round(b.x), Math.round(b.y), Math.round(b.width), Math.round(b.height)],
      transform: getComputedStyle(el).transform,
      opacity: getComputedStyle(el).opacity,
    };
  };
  return {
    hash: location.hash,
    hero: r(hero),
    slot: r(slot),
    rail: r(rail),
    heroWidthCss: hero ? getComputedStyle(hero).width : null,
    innerWidth,
  };
});
console.log(JSON.stringify(state, null, 2));
await browser.close();
