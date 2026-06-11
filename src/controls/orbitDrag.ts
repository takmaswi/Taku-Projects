/**
 * Weighted, inertial look-around control. Drag deltas feed a target
 * orientation; the actual orientation chases it through an exponential
 * lerp (the Lenis feel), and on release the sampled pointer velocity
 * keeps the sphere turning, decaying with friction until it settles.
 */

const DEG = Math.PI / 180;

interface Sample {
  t: number;
  x: number;
  y: number;
}

export interface OrbitDragOptions {
  /** radians of rotation per pixel of drag */
  sensitivity?: number;
  /** how hard the orientation chases its target; lower = heavier */
  smoothing?: number;
  /** per-second exponential decay of release velocity; lower = longer glide */
  friction?: number;
  pitchLimit?: number;
}

export class OrbitDrag {
  yaw = 0;
  pitch = 0;
  targetYaw = 0;
  targetPitch = 0;
  enabled = true;

  private sensitivity: number;
  private smoothing: number;
  private friction: number;
  private pitchLimit: number;

  private dragging = false;
  private pointerId = -1;
  private lastX = 0;
  private lastY = 0;
  private velYaw = 0;
  private velPitch = 0;
  private samples: Sample[] = [];
  private idleTime = 0;
  private idleDrift = 0.02;
  private el: HTMLElement;
  private moved = 0;

  constructor(el: HTMLElement, opts: OrbitDragOptions = {}) {
    this.el = el;
    this.sensitivity = opts.sensitivity ?? 0.0021;
    this.smoothing = opts.smoothing ?? 5.0;
    this.friction = opts.friction ?? 1.15;
    this.pitchLimit = opts.pitchLimit ?? 62 * DEG;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.idleDrift = 0;
    }

    el.addEventListener('pointerdown', this.onDown);
    window.addEventListener('pointermove', this.onMove);
    window.addEventListener('pointerup', this.onUp);
    window.addEventListener('pointercancel', this.onUp);
    el.addEventListener('wheel', this.onWheel, { passive: false });
  }

  /** True while the pointer is held down on the sphere. */
  get isDragging() {
    return this.dragging;
  }

  /** Pixels travelled in the current/last drag; used to tell click from drag. */
  get dragDistance() {
    return this.moved;
  }

  private onDown = (e: PointerEvent) => {
    if (!this.enabled || e.button !== 0) return;
    this.dragging = true;
    this.pointerId = e.pointerId;
    this.lastX = e.clientX;
    this.lastY = e.clientY;
    this.moved = 0;
    this.velYaw = 0;
    this.velPitch = 0;
    this.samples = [{ t: performance.now(), x: e.clientX, y: e.clientY }];
    this.idleTime = 0;
  };

  private onMove = (e: PointerEvent) => {
    if (!this.dragging || e.pointerId !== this.pointerId) return;
    const dx = e.clientX - this.lastX;
    const dy = e.clientY - this.lastY;
    this.lastX = e.clientX;
    this.lastY = e.clientY;
    this.moved += Math.abs(dx) + Math.abs(dy);

    // grab-the-world: the card under the cursor follows the hand
    this.targetYaw -= dx * this.sensitivity;
    this.targetPitch -= dy * this.sensitivity;
    this.clampPitch();

    const now = performance.now();
    this.samples.push({ t: now, x: e.clientX, y: e.clientY });
    while (this.samples.length > 2 && now - this.samples[0].t > 90) this.samples.shift();
  };

  private onUp = (e: PointerEvent) => {
    if (!this.dragging || e.pointerId !== this.pointerId) return;
    this.dragging = false;
    const now = performance.now();
    const recent = this.samples.filter((s) => now - s.t < 120);
    if (recent.length >= 2) {
      const a = recent[0];
      const b = recent[recent.length - 1];
      const dt = Math.max((b.t - a.t) / 1000, 1 / 240);
      // px/s -> rad/s through the same sensitivity, capped so a flick
      // spins with weight rather than whipping
      this.velYaw = clamp((-(b.x - a.x) / dt) * this.sensitivity, -3.2, 3.2);
      this.velPitch = clamp((-(b.y - a.y) / dt) * this.sensitivity * 0.6, -1.6, 1.6);
    }
    this.samples = [];
    this.idleTime = 0;
  };

  private onWheel = (e: WheelEvent) => {
    if (!this.enabled) return;
    e.preventDefault();
    const unit = e.deltaMode === 1 ? 18 : 1;
    const delta = clamp(e.deltaY * unit, -160, 160);
    this.targetYaw += delta * 0.00052;
    this.idleTime = 0;
  };

  update(dt: number) {
    if (!this.dragging) {
      // inertial glide
      this.targetYaw += this.velYaw * dt;
      this.targetPitch += this.velPitch * dt;
      this.clampPitch();
      const decay = Math.exp(-this.friction * dt);
      this.velYaw *= decay;
      this.velPitch *= decay;
      if (Math.abs(this.velYaw) < 0.002) this.velYaw = 0;
      if (Math.abs(this.velPitch) < 0.002) this.velPitch = 0;

      // after a quiet spell the sphere drifts, so it never feels parked
      this.idleTime += dt;
      if (this.idleTime > 5 && this.enabled) {
        const ease = Math.min((this.idleTime - 5) / 4, 1);
        this.targetYaw += this.idleDrift * ease * dt;
      }
    }

    // the weighted chase: identical maths to a Lenis lerp, framerate independent
    const k = 1 - Math.exp(-this.smoothing * dt);
    this.yaw += (this.targetYaw - this.yaw) * k;
    this.pitch += (this.targetPitch - this.pitch) * k;
  }

  /** Give the intro a push so the gallery arrives already moving. */
  impulse(yawVel: number) {
    this.velYaw += yawVel;
  }

  private clampPitch() {
    this.targetPitch = clamp(this.targetPitch, -this.pitchLimit, this.pitchLimit);
  }

  dispose() {
    this.el.removeEventListener('pointerdown', this.onDown);
    window.removeEventListener('pointermove', this.onMove);
    window.removeEventListener('pointerup', this.onUp);
    window.removeEventListener('pointercancel', this.onUp);
    this.el.removeEventListener('wheel', this.onWheel);
  }
}

function clamp(v: number, min: number, max: number) {
  return Math.min(Math.max(v, min), max);
}
