import gsap from 'gsap';
import Lenis from 'lenis';
import type { Card } from '../data/cards';
import { cards, statusLabel } from '../data/cards';
import type { Stage } from '../scene/stage';
import type { SphereGallery, CardView } from '../scene/sphereGallery';
import { computeFocusTarget, contentRectPx } from '../scene/focus';
import { glowColor } from '../scene/cardMaterial';

const RAIL_W = 460;
const MOBILE_BREAK = 760;

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DetailDeps {
  stage: Stage;
  gallery: SphereGallery;
  fadeWorld: (exceptId: string, recede: boolean) => void;
  setControls: (on: boolean) => void;
  onRequestClose: () => void;
}

export interface DetailController {
  readonly isOpen: boolean;
  open3d: (view: CardView) => void;
  openFlat: (card: Card) => void;
  close: () => Promise<void>;
}

function el<K extends keyof HTMLElementTagNameMap>(tag: K, className: string, parent?: HTMLElement) {
  const node = document.createElement(tag);
  node.className = className;
  parent?.appendChild(node);
  return node;
}

function flipFromTo(target: HTMLElement, from: Rect, to: Rect, vars: gsap.TweenVars) {
  return gsap.fromTo(
    target,
    {
      x: from.x - to.x,
      y: from.y - to.y,
      scaleX: from.width / to.width,
      scaleY: from.height / to.height,
      transformOrigin: '0 0',
    },
    { x: 0, y: 0, scaleX: 1, scaleY: 1, ...vars },
  );
}

export function createDetail(deps: DetailDeps): DetailController {
  const root = el('aside', 'detail');
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-modal', 'true');
  root.hidden = true;
  document.querySelector('#detail-root')!.appendChild(root);

  const veil = el('div', 'detail-veil', root);
  const heroSlot = el('div', 'detail-hero-slot', root);
  const hero = el('figure', 'detail-hero', heroSlot);
  const heroImg = el('img', 'detail-hero-img', hero);
  heroImg.draggable = false;
  heroImg.addEventListener('error', () => hero.classList.add('is-missing'));
  heroImg.addEventListener('load', () => hero.classList.remove('is-missing'));
  const heroChip = el('span', 'chip detail-hero-chip', hero);
  const rail = el('div', 'detail-rail', root);
  const closeBtn = el('button', 'detail-close', rail);
  closeBtn.innerHTML = '<span aria-hidden="true">&times;</span> Close';
  closeBtn.setAttribute('aria-label', 'Close project');
  const scroll = el('div', 'detail-scroll', rail);
  const inner = el('div', 'detail-inner', scroll);

  const eyebrow = el('p', 'detail-eyebrow', inner);
  const chip = el('span', 'chip', eyebrow);
  const count = el('span', 'detail-count', eyebrow);
  const title = el('h1', 'detail-title', inner);
  const desc = el('p', 'detail-desc', inner);
  const stackHead = el('p', 'detail-h', inner);
  stackHead.textContent = 'Stack';
  const stack = el('ul', 'detail-stack', inner);
  const actions = el('div', 'detail-actions', inner);

  let isOpen = false;
  let mode: '3d' | 'flat' = '3d';
  let currentView: CardView | null = null;
  let lenis: Lenis | null = null;
  let lenisTick: ((time: number) => void) | null = null;
  let lastFocus: Element | null = null;
  let busy = false;

  const requestClose = () => {
    if (isOpen && !busy) deps.onRequestClose();
  };
  veil.addEventListener('click', requestClose);
  closeBtn.addEventListener('click', requestClose);
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') requestClose();
  });

  function populate(card: Card) {
    const accent = card.accent;
    root.style.setProperty('--accent', accent);
    root.style.setProperty('--accent-bright', `#${glowColor(accent).getHexString()}`);

    heroImg.src = card.image;
    heroImg.alt =
      card.status === 'concept'
        ? `${card.title} design mockup`
        : `${card.title} interface screenshot`;
    heroChip.dataset.status = card.status;
    heroChip.textContent = statusLabel[card.status];
    chip.dataset.status = card.status;
    chip.textContent = statusLabel[card.status];
    const index = cards.findIndex((c) => c.id === card.id) + 1;
    count.textContent = `${String(index).padStart(2, '0')} / ${String(cards.length).padStart(2, '0')}`;
    title.textContent = card.title;
    desc.textContent = card.description;

    stack.replaceChildren();
    for (const tech of card.stack) {
      const li = el('li', 'detail-tech', stack);
      li.textContent = tech;
    }

    actions.replaceChildren();
    if (card.liveUrl) {
      const a = el('a', 'btn btn-primary', actions);
      a.href = card.liveUrl;
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = 'Open live site';
    }
    if (card.repoUrl) {
      const a = el('a', 'btn', actions);
      a.href = card.repoUrl;
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = 'View repo';
    }
    if (!card.repoUrl && card.status === 'built') {
      const span = el('span', 'detail-private', actions);
      span.textContent = 'Private repo';
    }
  }

  function railLines(): HTMLElement[] {
    return [eyebrow, title, desc, stackHead, stack, actions];
  }

  function heroLayout() {
    const vw = innerWidth;
    const vh = innerHeight;
    if (vw < MOBILE_BREAK) {
      return { cx: vw / 2, cy: vh * 0.22, pxWidth: vw * 0.88 };
    }
    const cx = (vw - RAIL_W) / 2;
    return { cx, cy: vh * 0.475, pxWidth: Math.min((vw - RAIL_W) * 0.76, 1000) };
  }

  function startLenis() {
    lenis = new Lenis({ wrapper: rail, content: scroll, duration: 1.1 });
    lenisTick = (time: number) => lenis?.raf(time * 1000);
    gsap.ticker.add(lenisTick);
  }

  function stopLenis() {
    if (lenisTick) gsap.ticker.remove(lenisTick);
    lenis?.destroy();
    lenis = null;
    lenisTick = null;
  }

  function open3d(view: CardView) {
    if (isOpen || busy) return;
    busy = true;
    isOpen = true;
    mode = '3d';
    currentView = view;
    lastFocus = document.activeElement;

    deps.setControls(false);
    deps.fadeWorld(view.card.id, true);
    populate(view.card);

    root.hidden = false;
    root.classList.remove('is-flat');
    gsap.set(hero, { opacity: 0 });
    gsap.set(rail, { xPercent: innerWidth < MOBILE_BREAK ? 0 : 8, opacity: 0 });
    gsap.fromTo(veil, { opacity: 0 }, { opacity: 1, duration: 0.8, ease: 'power2.inOut', delay: 0.2 });

    const layout = heroLayout();
    const target = computeFocusTarget(deps.stage, deps.gallery.group, layout.cx, layout.cy, layout.pxWidth);

    deps.gallery.focusCard(view, target, () => {
      const from = contentRectPx(view, deps.stage);
      const to = hero.getBoundingClientRect();
      gsap.set(hero, { opacity: 1 });
      flipFromTo(hero, from, to, { duration: 0.85, ease: 'power4.inOut' });
      gsap.to(view.mesh.material.uniforms.uOpacity, { value: 0, duration: 0.2, delay: 0.05 });

      gsap.to(rail, { xPercent: 0, opacity: 1, duration: 0.7, ease: 'power3.out', delay: 0.15 });
      gsap.fromTo(
        railLines(),
        { y: 34, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          stagger: 0.06,
          ease: 'power3.out',
          delay: 0.2,
          onComplete: () => {
            busy = false;
            startLenis();
            closeBtn.focus({ preventScroll: true });
          },
        },
      );
    });
  }

  function openFlat(card: Card) {
    if (isOpen || busy) return;
    isOpen = true;
    mode = 'flat';
    currentView = null;
    lastFocus = document.activeElement;

    populate(card);
    root.hidden = false;
    root.classList.add('is-flat');
    gsap.fromTo(veil, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'power2.out' });
    gsap.fromTo(
      hero,
      { opacity: 0, y: 26 },
      { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', clearProps: 'transform' },
    );
    gsap.set(rail, { xPercent: 0, opacity: 1 });
    gsap.fromTo(
      railLines(),
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, stagger: 0.05, ease: 'power3.out' },
    );
    startLenis();
    closeBtn.focus({ preventScroll: true });
  }

  async function close(): Promise<void> {
    if (!isOpen) return;
    // an open or close is mid-flight: wait it out instead of dropping the request
    const waitStart = performance.now();
    while (busy && performance.now() - waitStart < 3000) {
      await new Promise((r) => setTimeout(r, 90));
    }
    if (!isOpen || busy) return;
    busy = true;
    stopLenis();

    return new Promise((resolve) => {
      const done = () => {
        root.hidden = true;
        isOpen = false;
        busy = false;
        if (lastFocus instanceof HTMLElement) lastFocus.focus({ preventScroll: true });
        resolve();
      };

      if (mode === '3d' && currentView) {
        const view = currentView;
        gsap.to(railLines(), { y: -20, opacity: 0, duration: 0.3, stagger: 0.025, ease: 'power2.in' });
        gsap.to(rail, { opacity: 0, duration: 0.35, delay: 0.15, ease: 'power2.in' });

        // animate the hero from its resting layout onto the mesh rect
        const from = hero.getBoundingClientRect();
        const to = contentRectPx(view, deps.stage);
        gsap.to(hero, {
          x: to.x - from.x,
          y: to.y - from.y,
          scaleX: to.width / from.width,
          scaleY: to.height / from.height,
          transformOrigin: '0 0',
          duration: 0.7,
          ease: 'power3.inOut',
          delay: 0.18,
          onComplete: () => {
            gsap.to(view.mesh.material.uniforms.uOpacity, { value: 1, duration: 0.18 });
            gsap.to(hero, { opacity: 0, duration: 0.18 });
            gsap.to(veil, { opacity: 0, duration: 0.7, ease: 'power2.inOut' });
            deps.fadeWorld(view.card.id, false);
            deps.gallery.unfocusCard(view, () => {
              gsap.set(hero, { clearProps: 'all' });
              deps.setControls(true);
              done();
            });
          },
        });
      } else {
        gsap.to(railLines(), { y: -16, opacity: 0, duration: 0.25, stagger: 0.02, ease: 'power2.in' });
        gsap.to(hero, { opacity: 0, y: 16, duration: 0.3, ease: 'power2.in' });
        gsap.to(veil, {
          opacity: 0,
          duration: 0.4,
          delay: 0.1,
          ease: 'power2.inOut',
          onComplete: () => {
            gsap.set(hero, { clearProps: 'all' });
            done();
          },
        });
      }
    });
  }

  return {
    get isOpen() {
      return isOpen;
    },
    open3d,
    openFlat,
    close,
  };
}
