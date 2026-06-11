// Convert every capture-src PNG into a 1280x800 WebP under public/cards.
import sharp from 'sharp';
import { readdirSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const SRC = 'capture-src';
const OUT = 'public/cards';
mkdirSync(OUT, { recursive: true });

const files = readdirSync(SRC).filter((f) => f.endsWith('.png'));
for (const file of files) {
  const id = file.replace(/\.png$/, '');
  const out = join(OUT, `${id}.webp`);
  await sharp(join(SRC, file))
    .resize(1280, 800, { fit: 'cover', position: 'top' })
    .webp({ quality: 82 })
    .toFile(out);
  console.log('wrote', out);
}
console.log(`${files.length} cards converted`);
