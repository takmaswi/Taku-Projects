import gsap from 'gsap';
import type { Card } from '../data/cards';
import { statusLabel } from '../data/cards';

/**
 * The lower-third readout: status, title and pitch for the hovered card.
 * Also owns the one-time drag hint.
 */
export interface Hud {
  show: (card: Card) => void;
  hide: () => void;
  showHint: () => void;
  dismissHint: () => void;
}

export function createHud(): Hud {
  const root = document.querySelector<HTMLElement>('#hud')!;
  const status = document.querySelector<HTMLElement>('#hud-status')!;
  const title = document.querySelector<HTMLElement>('#hud-title')!;
  const pitch = document.querySelector<HTMLElement>('#hud-pitch')!;
  const hint = document.querySelector<HTMLElement>('#hint')!;

  let visible = false;
  let hintShown = false;
  let hintDismissed = false;

  const lines = [status, title, pitch];

  return {
    show(card) {
      status.textContent = statusLabel[card.status];
      status.dataset.status = card.status;
      title.textContent = card.title;
      pitch.textContent = card.pitch;
      gsap.killTweensOf(lines);
      if (!visible) {
        visible = true;
        root.classList.add('is-visible');
        gsap.fromTo(
          lines,
          { y: 18, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.55, stagger: 0.055, ease: 'power3.out' },
        );
      } else {
        gsap.fromTo(
          lines,
          { y: 10, opacity: 0.2 },
          { y: 0, opacity: 1, duration: 0.4, stagger: 0.04, ease: 'power3.out' },
        );
      }
    },
    hide() {
      if (!visible) return;
      visible = false;
      gsap.killTweensOf(lines);
      gsap.to(lines, {
        y: -10,
        opacity: 0,
        duration: 0.3,
        stagger: 0.03,
        ease: 'power2.in',
        onComplete: () => {
          if (!visible) root.classList.remove('is-visible');
        },
      });
    },
    showHint() {
      if (hintShown || hintDismissed) return;
      hintShown = true;
      hint.classList.add('is-visible');
    },
    dismissHint() {
      if (hintDismissed) return;
      hintDismissed = true;
      hint.classList.remove('is-visible');
    },
  };
}
