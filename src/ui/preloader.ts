import gsap from 'gsap';

export interface Preloader {
  update: (done: number, total: number, label: string) => void;
  /** Resolves once the exit animation finishes. */
  complete: () => Promise<void>;
  /** Remove instantly, for routes that do not need the sphere. */
  skip: () => void;
}

export function createPreloader(): Preloader {
  const root = document.querySelector<HTMLElement>('#preloader');
  const bar = document.querySelector<HTMLElement>('#preloader-bar');
  const pct = document.querySelector<HTMLElement>('#preloader-pct');
  const load = document.querySelector<HTMLElement>('#preloader-load');
  if (!root || !bar || !pct || !load) throw new Error('preloader DOM missing');

  const state = { shown: 0 };
  let actual = 0;

  // the bar chases real progress so it moves smoothly, not in 19 steps
  const tick = () => {
    state.shown += (actual - state.shown) * 0.12;
    const v = Math.min(state.shown, 1);
    bar.style.transform = `scaleX(${v})`;
    pct.textContent = String(Math.round(v * 100)).padStart(3, '0');
  };
  gsap.ticker.add(tick);

  return {
    update(done, total, label) {
      actual = done / total;
      load.textContent = label.toLowerCase();
    },
    complete() {
      actual = 1;
      return new Promise((resolve) => {
        gsap
          .timeline({
            delay: 0.25,
            onComplete: () => {
              gsap.ticker.remove(tick);
              root.remove();
              resolve();
            },
          })
          .to(root.querySelector('.preloader-inner'), {
            opacity: 0,
            y: -28,
            duration: 0.6,
            ease: 'power3.in',
          })
          .to(root, { opacity: 0, duration: 0.55, ease: 'power2.inOut' }, '-=0.15');
      });
    },
    skip() {
      gsap.ticker.remove(tick);
      root.remove();
    },
  };
}
