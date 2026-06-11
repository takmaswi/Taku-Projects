import * as THREE from 'three';
import type { Card } from '../data/cards';
import { glowColor } from './cardMaterial';

const COUNT = 420;

/**
 * A sparse dust field beyond the card shell. It parallaxes against the
 * gallery rotation so the void reads as deep space rather than a flat
 * black wall.
 */
export class Atmosphere {
  readonly points: THREE.Points;
  private material: THREE.PointsMaterial;
  private geometry: THREE.BufferGeometry;

  constructor(cards: Card[]) {
    const positions = new Float32Array(COUNT * 3);
    const colors = new Float32Array(COUNT * 3);
    const dim = new THREE.Color('#3a3a44');

    for (let i = 0; i < COUNT; i++) {
      const r = 11 + Math.pow(Math.random(), 1.6) * 30;
      const theta = Math.random() * Math.PI * 2;
      const y = (Math.random() * 2 - 1) * 0.95;
      const radius = Math.sqrt(1 - y * y);
      positions[i * 3] = Math.cos(theta) * radius * r;
      positions[i * 3 + 1] = y * r;
      positions[i * 3 + 2] = Math.sin(theta) * radius * r;

      // mostly dim neutral dust, one in six tinted by a project accent
      const c =
        Math.random() < 0.17
          ? glowColor(cards[Math.floor(Math.random() * cards.length)].accent)
          : dim;
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    this.material = new THREE.PointsMaterial({
      size: 0.16,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      sizeAttenuation: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    this.points = new THREE.Points(this.geometry, this.material);
  }

  /** Follow the gallery at a fraction of its rotation for parallax. */
  update(yaw: number, pitch: number, elapsed: number) {
    this.points.rotation.y = yaw * 0.42 + elapsed * 0.004;
    this.points.rotation.x = pitch * 0.42;
  }

  setOpacity(value: number) {
    this.material.opacity = value;
  }

  dispose() {
    this.geometry.dispose();
    this.material.dispose();
    this.points.removeFromParent();
  }
}
