import * as THREE from 'three';
import type { Stage } from './stage';
import type { SphereGallery, CardView } from './sphereGallery';

/**
 * Raycasts from the camera through the pointer every frame and reports
 * which card is under the cursor. Suppressed while dragging or when the
 * detail page owns the screen.
 */
export class HoverManager {
  enabled = true;

  private raycaster = new THREE.Raycaster();
  private pointer = new THREE.Vector2(99, 99);
  private pointerActive = false;
  private current: CardView | null = null;

  constructor(
    private stage: Stage,
    private gallery: SphereGallery,
    private onChange: (view: CardView | null) => void,
  ) {
    window.addEventListener('pointermove', this.onMove);
    window.addEventListener('pointerleave', this.onLeave);
  }

  private onMove = (e: PointerEvent) => {
    this.pointer.x = (e.clientX / this.stage.size.width) * 2 - 1;
    this.pointer.y = -(e.clientY / this.stage.size.height) * 2 + 1;
    this.pointerActive = e.pointerType !== 'touch';
  };

  private onLeave = () => {
    this.pointerActive = false;
  };

  get hovered(): CardView | null {
    return this.current;
  }

  /** Call once per frame; suppress=true while dragging. */
  update(suppress: boolean) {
    let next: CardView | null = null;
    if (this.enabled && this.pointerActive && !suppress) {
      this.raycaster.setFromCamera(this.pointer, this.stage.camera);
      const hits = this.raycaster.intersectObjects(this.gallery.meshes, false);
      if (hits.length > 0) {
        next = this.gallery.viewByMesh(hits[0].object) ?? null;
      }
    }
    if (next !== this.current) {
      this.current = next;
      this.onChange(next);
    }
  }

  /** The card under the pointer right now, fresh raycast (for click). */
  pick(): CardView | null {
    if (!this.pointerActive) return null;
    this.raycaster.setFromCamera(this.pointer, this.stage.camera);
    const hits = this.raycaster.intersectObjects(this.gallery.meshes, false);
    return hits.length ? (this.gallery.viewByMesh(hits[0].object) ?? null) : null;
  }

  dispose() {
    window.removeEventListener('pointermove', this.onMove);
    window.removeEventListener('pointerleave', this.onLeave);
  }
}
