import gsap from 'gsap';
import Lenis from 'lenis';
import { cards, statusLabel } from '../data/cards';
import { glowColor } from '../scene/cardMaterial';

/**
 * The plain route: every project as a responsive grid with the same
 * data and links. No WebGL required, fully keyboard navigable.
 */
export interface GridController {
  show: (animate: boolean) => void;
  hide: () => void;
  readonly isShown: boolean;
}

export function createGrid(): GridController {
  const host = document.querySelector<HTMLElement>('#grid-root')!;
  let built = false;
  let shown = false;
  let lenis: Lenis | null = null;
  let lenisTick: ((time: number) => void) | null = null;

  function build() {
    if (built) return;
    built = true;
    const page = document.createElement('main');
    page.className = 'grid-page';
    page.id = 'grid-page';

    const head = document.createElement('header');
    head.className = 'grid-head';
    head.innerHTML = `
      <p class="grid-kicker">Index</p>
      <h1 class="grid-title">All projects</h1>
      <p class="grid-sub">${cards.length} projects. Live means deployed, Built means real code running locally, Concept means a pitch designed for a client.</p>
      <a class="grid-back" href="#/">Back to the sphere</a>
    `;
    page.appendChild(head);

    const list = document.createElement('ol');
    list.className = 'grid-list';

    cards.forEach((card, i) => {
      const li = document.createElement('li');
      li.className = 'grid-card';
      li.style.setProperty('--accent', `#${glowColor(card.accent).getHexString()}`);

      const links: string[] = [];
      if (card.liveUrl) {
        links.push(
          `<a class="grid-link" href="${card.liveUrl}" target="_blank" rel="noopener">Live site</a>`,
        );
      }
      if (card.repoUrl) {
        links.push(
          `<a class="grid-link" href="${card.repoUrl}" target="_blank" rel="noopener">Repo</a>`,
        );
      }

      li.innerHTML = `
        <a class="grid-thumb" href="#/p/${card.id}" aria-label="${card.title}, open details">
          <img src="${card.image}" alt="" loading="${i < 6 ? 'eager' : 'lazy'}" width="1024" height="640" />
          <span class="chip" data-status="${card.status}">${statusLabel[card.status]}</span>
        </a>
        <div class="grid-meta">
          <p class="grid-index">${String(i + 1).padStart(2, '0')}</p>
          <h2 class="grid-card-title"><a href="#/p/${card.id}">${card.title}</a></h2>
          <p class="grid-pitch">${card.pitch}</p>
          <p class="grid-tags">${card.stack.join(' · ')}</p>
          ${links.length ? `<div class="grid-links">${links.join('')}</div>` : ''}
        </div>
      `;
      list.appendChild(li);
    });

    page.appendChild(list);

    const foot = document.createElement('footer');
    foot.className = 'grid-foot';
    foot.innerHTML = `<p>Takunda Maswi. Full-stack developer and AI agent builder, Harare.</p>`;
    page.appendChild(foot);

    host.appendChild(page);

    // missing captures fall back to an accent panel
    page.querySelectorAll<HTMLImageElement>('img').forEach((img) => {
      img.addEventListener('error', () => img.classList.add('is-missing'), { once: true });
    });
  }

  return {
    get isShown() {
      return shown;
    },
    show(animate) {
      if (shown) return;
      shown = true;
      build();
      document.body.classList.add('is-grid-route');
      host.style.display = 'block';
      window.scrollTo(0, 0);
      lenis = new Lenis({ duration: 1.05 });
      lenisTick = (time: number) => lenis?.raf(time * 1000);
      gsap.ticker.add(lenisTick);
      if (animate) {
        gsap.fromTo(
          '#grid-page .grid-head > *, #grid-page .grid-card',
          { y: 28, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.65, stagger: 0.035, ease: 'power3.out', clearProps: 'all' },
        );
      }
    },
    hide() {
      if (!shown) return;
      shown = false;
      if (lenisTick) gsap.ticker.remove(lenisTick);
      lenis?.destroy();
      lenis = null;
      lenisTick = null;
      document.body.classList.remove('is-grid-route');
      host.style.display = 'none';
    },
  };
}
