import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/syne/600.css';
import '@fontsource/syne/700.css';
import '@fontsource/syne/800.css';
import './styles/tokens.css';
import './styles/base.css';
import './styles/preloader.css';
import './styles/cursor.css';
import './styles/hud.css';
import './styles/detail.css';
import './styles/grid.css';

import * as THREE from 'three';
import gsap from 'gsap';
import { Stage } from './scene/stage';
import { loadCardTextures } from './scene/textures';
import { SphereGallery } from './scene/sphereGallery';
import { Atmosphere } from './scene/atmosphere';
import { HoverManager } from './scene/hover';
import { PostFX } from './scene/postfx';
import { presetIntro, runIntro } from './scene/intro';
import { OrbitDrag } from './controls/orbitDrag';
import { createPreloader } from './ui/preloader';
import { createCursor } from './ui/cursor';
import { createHud } from './ui/hud';
import { createDetail } from './ui/detail';
import { createGrid } from './ui/grid';
import { Router, type Route } from './router';
import { cards } from './data/cards';

function webglAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return canvas.getContext('webgl2') !== null;
  } catch {
    return false;
  }
}

/** No WebGL: the grid route becomes the whole site. */
function bootFlat() {
  document.body.classList.add('no-webgl');
  document.querySelector('#preloader')?.remove();
  document.querySelector('#hint')?.remove();
  const grid = createGrid();
  grid.show(false);
  const router = new Router();
  router.replace({ name: 'projects' });
  router.onChange(() => router.replace({ name: 'projects' }));
}

async function boot() {
  if (!webglAvailable()) {
    bootFlat();
    return;
  }

  const container = document.querySelector<HTMLElement>('#webgl');
  if (!container) throw new Error('missing #webgl container');

  const stage = new Stage(container);
  const preloader = createPreloader();
  const cursor = createCursor();
  const hud = createHud();
  const router = new Router();
  const grid = createGrid();

  // the grid route reads plain img tags; show it without waiting for
  // the sphere's textures
  if (router.current.name === 'projects') {
    preloader.skip();
    grid.show(false);
  }

  const textures = await loadCardTextures(cards, stage.renderer, (done, total, label) =>
    preloader.update(done, total, label),
  );

  const gallery = new SphereGallery(cards, textures.byId);
  stage.scene.add(gallery.group);

  const atmosphere = new Atmosphere(cards);
  stage.scene.add(atmosphere.points);

  const postfx = new PostFX(stage);
  const drag = new OrbitDrag(stage.renderer.domElement);

  const hover = new HoverManager(stage, gallery, (view) => {
    gallery.setHover(view?.card.id ?? null);
    cursor?.setHover(view !== null);
    if (view) {
      hud.show(view.card);
    } else {
      hud.hide();
    }
  });

  const setControls = (on: boolean) => {
    drag.enabled = on;
    hover.enabled = on;
    if (!on) {
      gallery.setHover(null);
      cursor?.setHover(false);
      hud.hide();
    }
  };

  const fog = stage.scene.fog as THREE.FogExp2;
  const atmosphereState = { opacity: 0.75 };
  const fadeWorld = (exceptId: string, recede: boolean) => {
    gallery.recede(exceptId, recede);
    gsap.to(fog, { density: recede ? 0.085 : 0.052, duration: 0.8, ease: 'power2.inOut' });
    gsap.to(atmosphereState, {
      opacity: recede ? 0.15 : 0.75,
      duration: 0.8,
      ease: 'power2.inOut',
      onUpdate: () => atmosphere.setOpacity(atmosphereState.opacity),
    });
  };

  let detailOrigin: 'home' | 'projects' = 'home';
  let introDone = false;

  const detail = createDetail({
    stage,
    gallery,
    fadeWorld,
    setControls,
    onRequestClose: () => {
      router.go(detailOrigin === 'projects' ? { name: 'projects' } : { name: 'home' });
    },
  });

  const introDeps = { stage, gallery, drag, postfx };

  async function ensureIntro() {
    if (introDone) return;
    introDone = true;
    await runIntro(introDeps);
    hud.showHint();
  }

  async function applyRoute(route: Route, prev?: Route) {
    if (route.name === 'home') {
      if (detail.isOpen) await detail.close();
      grid.hide();
      stage.start();
      await ensureIntro();
      return;
    }

    if (route.name === 'projects') {
      if (detail.isOpen) await detail.close();
      grid.show(true);
      if (!detail.isOpen) stage.stop();
      return;
    }

    const card = cards.find((c) => c.id === route.id);
    if (!card) {
      router.replace({ name: 'home' });
      return;
    }
    if (detail.isOpen) await detail.close();
    if (grid.isShown || prev?.name === 'projects') {
      detailOrigin = 'projects';
      detail.openFlat(card);
    } else {
      detailOrigin = 'home';
      stage.start();
      await ensureIntro();
      const view = gallery.viewById(card.id);
      if (view) detail.open3d(view);
    }
  }

  router.onChange((route, prev) => {
    void applyRoute(route, prev);
  });

  // click = a press that never turned into a drag
  stage.renderer.domElement.addEventListener('pointerup', (e) => {
    if (!introDone || detail.isOpen || !drag.enabled) return;
    if (e.button !== 0 || drag.dragDistance > 7) return;
    const picked = hover.pick();
    if (picked) router.go({ name: 'project', id: picked.card.id });
  });

  stage.renderer.domElement.addEventListener('pointerdown', () => hud.dismissHint(), {
    once: true,
  });

  stage.onFrame((dt, elapsed) => {
    drag.update(dt);
    gallery.group.rotation.x = drag.pitch;
    gallery.group.rotation.y = drag.yaw;
    atmosphere.update(drag.yaw, drag.pitch, elapsed);
    hover.update(drag.isDragging && drag.dragDistance > 7);
  });

  // full teardown so nothing leaks GPU memory when the page goes away
  const disposeAll = () => {
    hover.dispose();
    drag.dispose();
    postfx.dispose();
    gallery.dispose();
    atmosphere.dispose();
    textures.dispose();
    cursor?.dispose();
    stage.dispose();
  };
  window.addEventListener('pagehide', disposeAll, { once: true });
  if (import.meta.hot) {
    import.meta.hot.dispose(disposeAll);
  }

  presetIntro(introDeps);
  stage.start();
  await preloader.complete();

  const startRoute = router.current;
  if (startRoute.name === 'projects') {
    grid.show(false);
    stage.stop();
  } else if (startRoute.name === 'project') {
    await ensureIntro();
    void applyRoute(startRoute);
  } else {
    await ensureIntro();
  }
}

boot().catch((err) => {
  console.error(err);
});
