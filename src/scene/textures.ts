import * as THREE from 'three';
import type { Card } from '../data/cards';
import { statusLabel } from '../data/cards';

const TEX_W = 1024;
const TEX_H = 640;

const statusColor: Record<Card['status'], string> = {
  live: '#3dd68c',
  built: '#e8a33d',
  concept: '#9d8cff',
};

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const fail = (why: string) => reject(new Error(`image failed (${why}): ${src}`));
    // a missing file must fall back, never stall the preloader
    const timer = setTimeout(() => fail('timeout'), 8000);
    img.onload = () => {
      clearTimeout(timer);
      resolve(img);
    };
    img.onerror = () => {
      clearTimeout(timer);
      fail('error');
    };
    img.src = src;
  });
}

function drawCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement) {
  const scale = Math.max(TEX_W / img.width, TEX_H / img.height);
  const w = img.width * scale;
  const h = img.height * scale;
  ctx.drawImage(img, (TEX_W - w) / 2, (TEX_H - h) / 2, w, h);
}

/** Placeholder art when a capture is missing: accent field + title. */
function drawFallback(ctx: CanvasRenderingContext2D, card: Card) {
  ctx.fillStyle = '#141418';
  ctx.fillRect(0, 0, TEX_W, TEX_H);
  const g = ctx.createRadialGradient(TEX_W * 0.78, TEX_H * 0.2, 40, TEX_W * 0.78, TEX_H * 0.2, TEX_W * 0.9);
  g.addColorStop(0, card.accent + '55');
  g.addColorStop(1, 'transparent');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, TEX_W, TEX_H);
  ctx.fillStyle = '#ededef';
  ctx.font = '700 64px Syne, sans-serif';
  ctx.textBaseline = 'bottom';
  wrapText(ctx, card.title, 64, TEX_H - 64, TEX_W - 128, 72);
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  bottomY: number,
  maxWidth: number,
  lineHeight: number,
) {
  const words = text.split(' ');
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const probe = line ? `${line} ${word}` : word;
    if (ctx.measureText(probe).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = probe;
    }
  }
  lines.push(line);
  lines.forEach((l, i) => {
    ctx.fillText(l, x, bottomY - (lines.length - 1 - i) * lineHeight);
  });
}

function drawStatusChip(ctx: CanvasRenderingContext2D, card: Card) {
  const label = statusLabel[card.status].toUpperCase();
  const color = statusColor[card.status];
  ctx.font = '600 24px Inter, sans-serif';
  ctx.textBaseline = 'middle';
  const padX = 22;
  const dotR = 5;
  const textW = ctx.measureText(label).width;
  const w = padX * 2 + dotR * 2 + 12 + textW;
  const h = 46;
  const x = 26;
  const y = 26;

  ctx.beginPath();
  ctx.roundRect(x, y, w, h, h / 2);
  ctx.fillStyle = 'rgba(11, 11, 13, 0.78)';
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.globalAlpha = 0.55;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.globalAlpha = 1;

  ctx.beginPath();
  ctx.arc(x + padX + dotR, y + h / 2, dotR, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.fillStyle = color;
  ctx.letterSpacing = '3px';
  ctx.fillText(label, x + padX + dotR * 2 + 12, y + h / 2 + 1);
  ctx.letterSpacing = '0px';
}

async function composeCard(card: Card): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  canvas.width = TEX_W;
  canvas.height = TEX_H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('no 2d context');

  try {
    const img = await loadImage(card.image);
    drawCover(ctx, img);
    // tone the bake down so light UI fields sit inside the dark scene
    // instead of blowing out under bloom; the detail page shows the
    // original file at full brightness
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = '#d6d6d8';
    ctx.fillRect(0, 0, TEX_W, TEX_H);
    ctx.globalCompositeOperation = 'source-over';
  } catch {
    drawFallback(ctx, card);
  }
  drawStatusChip(ctx, card);
  return canvas;
}

export interface LoadedTextures {
  byId: Map<string, THREE.CanvasTexture>;
  dispose: () => void;
}

export async function loadCardTextures(
  cardList: Card[],
  renderer: THREE.WebGLRenderer,
  onProgress: (done: number, total: number, label: string) => void,
): Promise<LoadedTextures> {
  await document.fonts.load('600 24px Inter').catch(() => undefined);
  await document.fonts.load('700 64px Syne').catch(() => undefined);

  const maxAniso = renderer.capabilities.getMaxAnisotropy();
  const byId = new Map<string, THREE.CanvasTexture>();
  let done = 0;

  // a small pool: parallel enough to be quick, bounded so decode work
  // never starves a weak device
  const queue = [...cardList];
  const worker = async () => {
    for (let card = queue.shift(); card; card = queue.shift()) {
      const canvas = await composeCard(card);
      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = maxAniso;
      tex.generateMipmaps = true;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      byId.set(card.id, tex);
      done += 1;
      onProgress(done, cardList.length, card.title);
    }
  };
  await Promise.all(Array.from({ length: 4 }, worker));

  return {
    byId,
    dispose: () => {
      byId.forEach((t) => t.dispose());
      byId.clear();
    },
  };
}
