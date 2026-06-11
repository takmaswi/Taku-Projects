import * as THREE from 'three';
import gsap from 'gsap';
import type { Card } from '../data/cards';
import { createCardMaterial, BASE_GLOW } from './cardMaterial';

export const SPHERE_RADIUS = 6.0;
export const CARD_W = 3.2;
export const CARD_H = 2.0; // 16:10
/** Shader border margin, in units where card height = 1. Keep in sync
 *  with `margin` in cardMaterial.ts. */
export const CONTENT_MARGIN = 0.085;
const LAT_COMPRESS = 0.74; // bias cards toward the equator band

export interface CardView {
  card: Card;
  mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  basePosition: THREE.Vector3;
  baseQuaternion: THREE.Quaternion;
}

/** Evenly spread n directions with the golden angle, gently compressed
 *  toward the equator so nothing sits dead on a pole. */
function fibonacciDirections(n: number): THREE.Vector3[] {
  const golden = Math.PI * (3 - Math.sqrt(5));
  const dirs: THREE.Vector3[] = [];
  for (let i = 0; i < n; i++) {
    const y = (1 - (2 * (i + 0.5)) / n) * LAT_COMPRESS;
    const radius = Math.sqrt(1 - y * y);
    const theta = golden * i;
    dirs.push(new THREE.Vector3(Math.cos(theta) * radius, y, Math.sin(theta) * radius).normalize());
  }
  return dirs;
}

/** A plane whose vertices are pushed onto the sphere surface so the card
 *  sits on the inside of the shell instead of floating flat. */
function curvedCardGeometry(): THREE.PlaneGeometry {
  const geo = new THREE.PlaneGeometry(CARD_W, CARD_H, 16, 10);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = SPHERE_RADIUS - Math.sqrt(Math.max(SPHERE_RADIUS * SPHERE_RADIUS - x * x - y * y, 0));
    pos.setZ(i, z);
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
}

export class SphereGallery {
  readonly group = new THREE.Group();
  readonly views: CardView[] = [];
  private geometry = curvedCardGeometry();
  private hoveredId: string | null = null;
  private raycastTargets: THREE.Mesh[] = [];

  constructor(cards: Card[], textures: Map<string, THREE.Texture>) {
    const dirs = fibonacciDirections(cards.length);
    cards.forEach((card, i) => {
      const texture = textures.get(card.id);
      if (!texture) throw new Error(`missing texture for ${card.id}`);
      const material = createCardMaterial(texture, card.accent, CARD_W / CARD_H);
      const mesh = new THREE.Mesh(this.geometry, material);
      mesh.position.copy(dirs[i]).multiplyScalar(SPHERE_RADIUS);
      mesh.lookAt(0, 0, 0);
      mesh.userData.cardId = card.id;
      this.group.add(mesh);
      this.views.push({
        card,
        mesh,
        basePosition: mesh.position.clone(),
        baseQuaternion: mesh.quaternion.clone(),
      });
      this.raycastTargets.push(mesh);
    });
  }

  get meshes(): THREE.Mesh[] {
    return this.raycastTargets;
  }

  viewById(id: string): CardView | undefined {
    return this.views.find((v) => v.card.id === id);
  }

  viewByMesh(mesh: THREE.Object3D): CardView | undefined {
    return this.views.find((v) => v.mesh === mesh);
  }

  /** Hover treatment: the card under the cursor lifts and glows, the
   *  rest of the constellation dims back. */
  setHover(id: string | null) {
    if (id === this.hoveredId) return;
    this.hoveredId = id;
    for (const view of this.views) {
      const u = view.mesh.material.uniforms;
      const isHovered = view.card.id === id;
      const anyHover = id !== null;
      gsap.to(u.uBrightness, {
        value: isHovered ? 1.18 : anyHover ? 0.45 : 1,
        duration: 0.55,
        ease: 'power3.out',
        overwrite: true,
      });
      gsap.to(u.uGlow, {
        value: isHovered ? 1 : anyHover ? 0.12 : BASE_GLOW,
        duration: 0.55,
        ease: 'power3.out',
        overwrite: true,
      });
      gsap.to(view.mesh.scale, {
        x: isHovered ? 1.07 : 1,
        y: isHovered ? 1.07 : 1,
        z: 1,
        duration: 0.6,
        ease: 'power3.out',
        overwrite: true,
      });
    }
  }

  /** Fade every card except one; used behind the detail page. */
  recede(exceptId: string, on: boolean) {
    for (const view of this.views) {
      if (view.card.id === exceptId) continue;
      const u = view.mesh.material.uniforms;
      gsap.to(u.uOpacity, {
        value: on ? 0.05 : 1,
        duration: on ? 0.7 : 0.9,
        ease: 'power2.inOut',
        overwrite: true,
      });
      gsap.to(u.uBrightness, {
        value: on ? 0.35 : 1,
        duration: on ? 0.7 : 0.9,
        ease: 'power2.inOut',
        overwrite: true,
      });
    }
  }

  /** Fly a card from the shell to a focus pose in front of the camera. */
  focusCard(
    view: CardView,
    target: { position: THREE.Vector3; quaternion: THREE.Quaternion; scale: number },
    onComplete?: () => void,
  ) {
    const { mesh } = view;
    mesh.renderOrder = 10;
    const fromQuat = mesh.quaternion.clone();
    const progress = { t: 0 };
    const tl = gsap.timeline({ onComplete });
    tl.to(
      mesh.position,
      {
        x: target.position.x,
        y: target.position.y,
        z: target.position.z,
        duration: 1.0,
        ease: 'power3.inOut',
      },
      0,
    );
    tl.to(
      mesh.scale,
      { x: target.scale, y: target.scale, z: target.scale, duration: 1.0, ease: 'power3.inOut' },
      0,
    );
    tl.to(
      progress,
      {
        t: 1,
        duration: 1.0,
        ease: 'power3.inOut',
        onUpdate: () => {
          mesh.quaternion.slerpQuaternions(fromQuat, target.quaternion, progress.t);
        },
      },
      0,
    );
    tl.to(mesh.material.uniforms.uGlow, { value: 0.1, duration: 0.6, ease: 'power2.out' }, 0);
    tl.to(mesh.material.uniforms.uBrightness, { value: 1, duration: 0.6, ease: 'power2.out' }, 0);
    return tl;
  }

  /** Return a focused card to its place on the shell. */
  unfocusCard(view: CardView, onComplete?: () => void) {
    const { mesh } = view;
    const fromQuat = mesh.quaternion.clone();
    const progress = { t: 0 };
    const tl = gsap.timeline({
      onComplete: () => {
        mesh.renderOrder = 0;
        onComplete?.();
      },
    });
    tl.to(
      mesh.position,
      {
        x: view.basePosition.x,
        y: view.basePosition.y,
        z: view.basePosition.z,
        duration: 0.95,
        ease: 'power3.inOut',
      },
      0,
    );
    tl.to(mesh.scale, { x: 1, y: 1, z: 1, duration: 0.95, ease: 'power3.inOut' }, 0);
    tl.to(
      progress,
      {
        t: 1,
        duration: 0.95,
        ease: 'power3.inOut',
        onUpdate: () => {
          mesh.quaternion.slerpQuaternions(fromQuat, view.baseQuaternion, progress.t);
        },
      },
      0,
    );
    tl.to(
      mesh.material.uniforms.uGlow,
      { value: BASE_GLOW, duration: 0.6, ease: 'power2.out' },
      0.3,
    );
    return tl;
  }

  dispose() {
    this.views.forEach((v) => {
      v.mesh.material.dispose();
    });
    this.geometry.dispose();
    this.group.removeFromParent();
  }
}
