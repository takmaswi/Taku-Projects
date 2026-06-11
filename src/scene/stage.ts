import * as THREE from 'three';

export interface StageSize {
  width: number;
  height: number;
  dpr: number;
}

type FrameCallback = (dt: number, elapsed: number) => void;
type RenderOverride = (dt: number) => void;

/**
 * Owns the renderer, scene, camera and the frame loop.
 * The camera sits at the origin and never translates; everything
 * else rotates around it.
 */
export class Stage {
  readonly renderer: THREE.WebGLRenderer;
  readonly scene: THREE.Scene;
  readonly camera: THREE.PerspectiveCamera;
  readonly size: StageSize = { width: 1, height: 1, dpr: 1 };

  private frameCallbacks = new Set<FrameCallback>();
  private renderOverride: RenderOverride | null = null;
  private resizeCallbacks = new Set<(s: StageSize) => void>();
  private clock = new THREE.Clock();
  private rafId = 0;
  private running = false;

  constructor(container: HTMLElement) {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.NoToneMapping;
    container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#0b0b0d');
    this.scene.fog = new THREE.FogExp2('#0b0b0d', 0.052);

    this.camera = new THREE.PerspectiveCamera(70, 1, 0.1, 120);
    this.camera.position.set(0, 0, 0);
    this.scene.add(this.camera);

    this.applySize();
    window.addEventListener('resize', this.applySize);
  }

  private applySize = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.size.width = width;
    this.size.height = height;
    this.size.dpr = dpr;
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(width, height);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.resizeCallbacks.forEach((cb) => cb(this.size));
  };

  onFrame(cb: FrameCallback): () => void {
    this.frameCallbacks.add(cb);
    return () => this.frameCallbacks.delete(cb);
  }

  onResize(cb: (s: StageSize) => void): () => void {
    this.resizeCallbacks.add(cb);
    return () => this.resizeCallbacks.delete(cb);
  }

  /** Post-processing replaces the default render call through this. */
  setRenderOverride(fn: RenderOverride | null) {
    this.renderOverride = fn;
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.clock.start();
    const loop = () => {
      if (!this.running) return;
      this.rafId = requestAnimationFrame(loop);
      const dt = Math.min(this.clock.getDelta(), 1 / 20);
      const elapsed = this.clock.elapsedTime;
      this.frameCallbacks.forEach((cb) => cb(dt, elapsed));
      if (this.renderOverride) {
        this.renderOverride(dt);
      } else {
        this.renderer.render(this.scene, this.camera);
      }
    };
    loop();
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.rafId);
  }

  dispose() {
    this.stop();
    window.removeEventListener('resize', this.applySize);
    this.frameCallbacks.clear();
    this.resizeCallbacks.clear();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}
