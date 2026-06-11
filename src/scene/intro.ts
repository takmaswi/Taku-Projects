import gsap from 'gsap';
import type { Stage } from './stage';
import type { SphereGallery } from './sphereGallery';
import type { OrbitDrag } from '../controls/orbitDrag';
import type { PostFX } from './postfx';

export const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export interface IntroDeps {
  stage: Stage;
  gallery: SphereGallery;
  drag: OrbitDrag;
  postfx: PostFX;
}

/** State the scene holds while the preloader is still up. */
export function presetIntro({ stage, gallery, drag, postfx }: IntroDeps) {
  if (prefersReducedMotion()) {
    postfx.bloom.strength = 0.26;
    return;
  }
  stage.camera.fov = 94;
  stage.camera.updateProjectionMatrix();
  drag.yaw = -0.9;
  drag.targetYaw = -0.9;
  drag.pitch = -0.14;
  drag.targetPitch = -0.14;
  gallery.group.scale.setScalar(0.86);
  postfx.bloom.strength = 0;
  gallery.views.forEach((v) => {
    v.mesh.material.uniforms.uOpacity.value = 0;
  });
}

/** The arrival: cards ignite, the camera eases back, the sphere settles. */
export function runIntro({ stage, gallery, drag, postfx }: IntroDeps): Promise<void> {
  if (prefersReducedMotion()) {
    return new Promise((resolve) => {
      gsap.fromTo(
        gallery.views.map((v) => v.mesh.material.uniforms.uOpacity),
        { value: 0 },
        { value: 1, duration: 0.5, ease: 'power1.out', onComplete: resolve },
      );
    });
  }

  return new Promise((resolve) => {
    const tl = gsap.timeline({ onComplete: resolve });

    tl.to(
      gallery.views.map((v) => v.mesh.material.uniforms.uOpacity),
      { value: 1, duration: 0.9, stagger: { each: 0.05, from: 'random' }, ease: 'power2.out' },
      0,
    );
    tl.to(
      stage.camera,
      {
        fov: 70,
        duration: 2.3,
        ease: 'power3.inOut',
        onUpdate: () => stage.camera.updateProjectionMatrix(),
      },
      0.15,
    );
    tl.to(gallery.group.scale, { x: 1, y: 1, z: 1, duration: 2.3, ease: 'power3.out' }, 0.15);
    tl.to(drag, { targetYaw: 0, targetPitch: 0, duration: 2.5, ease: 'power2.inOut' }, 0.1);
    tl.to(postfx.bloom, { strength: 0.26, duration: 1.6, ease: 'power2.in' }, 0.5);
    tl.add(() => drag.impulse(0.22), 2.45);
  });
}
