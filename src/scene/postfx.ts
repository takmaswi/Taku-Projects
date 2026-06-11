import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import type { Stage } from './stage';

/**
 * Restrained finishing: subtle bloom, a vignette, chromatic aberration
 * that only lives at the frame edges, and a whisper of GPU grain to
 * kill banding in the dark field. If any of it reads as a filter, the
 * numbers here are too high.
 */

const FinalShader = {
  uniforms: {
    tDiffuse: { value: null as THREE.Texture | null },
    uTime: { value: 0 },
    uVignette: { value: 0.58 },
    uCA: { value: 0.006 },
    uGrain: { value: 0.03 },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float uTime;
    uniform float uVignette;
    uniform float uCA;
    uniform float uGrain;
    varying vec2 vUv;

    float hash(vec2 p) {
      vec3 p3 = fract(vec3(p.xyx) * 0.1031);
      p3 += dot(p3, p3.yzx + 33.33);
      return fract((p3.x + p3.y) * p3.z);
    }

    void main() {
      vec2 d = vUv - 0.5;
      float r2 = dot(d, d);

      // chromatic aberration grows with the square of the radius, so the
      // centre stays clean
      vec2 off = d * r2 * uCA * 4.0;
      vec3 col;
      col.r = texture2D(tDiffuse, vUv - off).r;
      col.g = texture2D(tDiffuse, vUv).g;
      col.b = texture2D(tDiffuse, vUv + off).b;

      // vignette
      float vig = 1.0 - smoothstep(0.18, 0.95, length(d) * 1.35) * uVignette;
      col *= vig;

      // fine animated grain, also dithers the dark gradients
      float g = hash(vUv * vec2(1920.0, 1080.0) + fract(uTime * 13.7) * 100.0);
      col += (g - 0.5) * uGrain;

      gl_FragColor = vec4(col, 1.0);
    }
  `,
};

export class PostFX {
  readonly composer: EffectComposer;
  readonly bloom: UnrealBloomPass;
  private finalPass: ShaderPass;
  private stage: Stage;
  private offResize: () => void;

  constructor(stage: Stage) {
    this.stage = stage;
    const { width, height, dpr } = stage.size;

    const target = new THREE.WebGLRenderTarget(width * dpr, height * dpr, {
      type: THREE.HalfFloatType,
      samples: 4,
    });
    this.composer = new EffectComposer(stage.renderer, target);
    this.composer.setPixelRatio(dpr);
    this.composer.setSize(width, height);

    this.composer.addPass(new RenderPass(stage.scene, stage.camera));

    this.bloom = new UnrealBloomPass(new THREE.Vector2(width, height), 0.26, 0.7, 0.82);
    this.composer.addPass(this.bloom);

    this.finalPass = new ShaderPass(FinalShader);
    this.composer.addPass(this.finalPass);

    this.offResize = stage.onResize(({ width: w, height: h, dpr: ratio }) => {
      this.composer.setPixelRatio(ratio);
      this.composer.setSize(w, h);
    });

    stage.setRenderOverride((dt) => {
      this.finalPass.uniforms.uTime.value += dt;
      this.composer.render(dt);
    });
  }

  dispose() {
    this.offResize();
    this.stage.setRenderOverride(null);
    this.composer.dispose();
  }
}
