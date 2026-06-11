/** Tiny hash router: '#/' gallery, '#/projects' grid, '#/p/:id' detail. */

export type Route =
  | { name: 'home' }
  | { name: 'projects' }
  | { name: 'project'; id: string };

export function parseHash(hash: string): Route {
  const h = hash.replace(/^#\/?/, '');
  if (h === 'projects') return { name: 'projects' };
  const m = h.match(/^p\/([\w-]+)$/);
  if (m) return { name: 'project', id: m[1] };
  return { name: 'home' };
}

export class Router {
  private listeners = new Set<(route: Route, prev: Route) => void>();
  current: Route = parseHash(location.hash);

  constructor() {
    window.addEventListener('hashchange', () => {
      const prev = this.current;
      this.current = parseHash(location.hash);
      this.listeners.forEach((cb) => cb(this.current, prev));
    });
  }

  onChange(cb: (route: Route, prev: Route) => void) {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  go(route: Route) {
    const hash =
      route.name === 'home' ? '#/' : route.name === 'projects' ? '#/projects' : `#/p/${route.id}`;
    if (location.hash === hash) return;
    location.hash = hash;
  }

  /** Replace without adding a history entry (for boot normalisation). */
  replace(route: Route) {
    const hash =
      route.name === 'home' ? '#/' : route.name === 'projects' ? '#/projects' : `#/p/${route.id}`;
    history.replaceState(null, '', hash);
    this.current = parseHash(hash);
  }
}
