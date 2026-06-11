import gsap from 'gsap';

/**
 * Custom cursor: a dot that sticks to the pointer and a ring that
 * trails it with weight. Grows over cards and DOM interactive elements.
 * Never created on touch-only devices.
 */
export interface Cursor {
  setHover: (on: boolean) => void;
  setHidden: (on: boolean) => void;
  dispose: () => void;
}

export function createCursor(): Cursor | null {
  if (!window.matchMedia('(pointer: fine)').matches) return null;
  const root = document.querySelector<HTMLElement>('#cursor');
  if (!root) return null;

  document.documentElement.classList.add('has-custom-cursor');
  const dot = root.querySelector<HTMLElement>('.cursor-dot')!;
  const ring = root.querySelector<HTMLElement>('.cursor-ring')!;

  const pos = { x: innerWidth / 2, y: innerHeight / 2 };
  const ringPos = { x: pos.x, y: pos.y };
  let seen = false;

  const onMove = (e: PointerEvent) => {
    pos.x = e.clientX;
    pos.y = e.clientY;
    if (!seen) {
      seen = true;
      ringPos.x = pos.x;
      ringPos.y = pos.y;
      root.style.opacity = '1';
    }
  };
  const onDown = () => root.classList.add('is-down');
  const onUp = () => root.classList.remove('is-down');

  // DOM interactive elements also grow the ring
  const onOver = (e: Event) => {
    const t = e.target as HTMLElement;
    if (t.closest('a, button, [data-cursor]')) root.classList.add('is-link');
  };
  const onOut = (e: Event) => {
    const t = e.target as HTMLElement;
    if (t.closest('a, button, [data-cursor]')) root.classList.remove('is-link');
  };

  window.addEventListener('pointermove', onMove, { passive: true });
  window.addEventListener('pointerdown', onDown);
  window.addEventListener('pointerup', onUp);
  document.addEventListener('mouseover', onOver);
  document.addEventListener('mouseout', onOut);

  const tick = () => {
    dot.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
    ringPos.x += (pos.x - ringPos.x) * 0.16;
    ringPos.y += (pos.y - ringPos.y) * 0.16;
    ring.style.transform = `translate(${ringPos.x}px, ${ringPos.y}px)`;
  };
  gsap.ticker.add(tick);

  return {
    setHover(on) {
      root.classList.toggle('is-hover', on);
    },
    setHidden(on) {
      root.classList.toggle('is-hidden', on);
    },
    dispose() {
      gsap.ticker.remove(tick);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      document.removeEventListener('mouseover', onOver);
      document.removeEventListener('mouseout', onOut);
      document.documentElement.classList.remove('has-custom-cursor');
    },
  };
}
