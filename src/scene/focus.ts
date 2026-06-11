import * as THREE from 'three';
import type { Stage } from './stage';
import type { CardView } from './sphereGallery';
import { CARD_W, CARD_H, SPHERE_RADIUS, CONTENT_MARGIN } from './sphereGallery';

/** Half extents of the image area inside the card, world units. */
export const CONTENT_HALF = {
  x: CARD_W / 2 - CONTENT_MARGIN * CARD_H,
  y: CARD_H / 2 - CONTENT_MARGIN * CARD_H,
};

export const CONTENT_ASPECT = CONTENT_HALF.x / CONTENT_HALF.y;

const FOCUS_DIST = 3.4;
const scratch = new THREE.Object3D();

export interface FocusTarget {
  position: THREE.Vector3;
  quaternion: THREE.Quaternion;
  scale: number;
}

/**
 * Where a card must sit (in the rotating group's local space) so its
 * image area is centred on screen pixel (cx, cy) at pxWidth wide.
 */
export function computeFocusTarget(
  stage: Stage,
  group: THREE.Object3D,
  cx: number,
  cy: number,
  pxWidth: number,
): FocusTarget {
  const { width, height } = stage.size;
  const ndc = new THREE.Vector3((cx / width) * 2 - 1, -(cy / height) * 2 + 1, 0.5);
  const dir = ndc.unproject(stage.camera).normalize();
  const worldPos = dir.multiplyScalar(FOCUS_DIST);

  scratch.position.copy(worldPos);
  scratch.lookAt(0, 0, 0);
  const worldQuat = scratch.quaternion.clone();

  const fovRad = (stage.camera.fov * Math.PI) / 180;
  const worldPerPx = (2 * FOCUS_DIST * Math.tan(fovRad / 2)) / height;
  const scale = (pxWidth * worldPerPx) / (CONTENT_HALF.x * 2);

  const invGroup = group.quaternion.clone().invert();
  return {
    position: worldPos.applyQuaternion(invGroup),
    quaternion: invGroup.multiply(worldQuat),
    scale,
  };
}

const corner = new THREE.Vector3();

/** Screen-pixel bounding rect of a card's image area, right now. */
export function contentRectPx(view: CardView, stage: Stage) {
  const { width, height } = stage.size;
  view.mesh.updateWorldMatrix(true, false);
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const sx of [-1, 1]) {
    for (const sy of [-1, 1]) {
      const x = CONTENT_HALF.x * sx;
      const y = CONTENT_HALF.y * sy;
      const z = SPHERE_RADIUS - Math.sqrt(SPHERE_RADIUS * SPHERE_RADIUS - x * x - y * y);
      corner.set(x, y, z);
      view.mesh.localToWorld(corner);
      corner.project(stage.camera);
      const px = ((corner.x + 1) / 2) * width;
      const py = ((1 - corner.y) / 2) * height;
      minX = Math.min(minX, px);
      minY = Math.min(minY, py);
      maxX = Math.max(maxX, px);
      maxY = Math.max(maxY, py);
    }
  }
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}
