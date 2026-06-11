import * as THREE from 'three';

/**
 * Card shader: screenshot in a rounded rect, accent border ring and a
 * soft accent glow that bleeds past the image edge. Brightness, glow and
 * opacity are uniforms so hover and the detail transition can animate
 * them without rebaking the texture. Includes the scene fog so far cards
 * sink into the dark.
 */

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  #include <fog_pars_vertex>
  void main() {
    vUv = uv;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    #include <fog_vertex>
  }
`;

const fragmentShader = /* glsl */ `
  uniform sampler2D map;
  uniform vec3 uAccent;
  uniform float uBrightness;
  uniform float uGlow;
  uniform float uOpacity;
  uniform float uAspect;
  varying vec2 vUv;
  #include <fog_pars_fragment>

  float sdRoundBox(vec2 p, vec2 b, float r) {
    vec2 q = abs(p) - b + r;
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
  }

  void main() {
    vec2 p = (vUv - 0.5) * vec2(uAspect, 1.0);
    float margin = 0.085;
    vec2 contentHalf = vec2(uAspect * 0.5 - margin, 0.5 - margin);
    float d = sdRoundBox(p, contentHalf, 0.035);

    vec2 imageUv = clamp(p / (contentHalf * 2.0) + 0.5, 0.0, 1.0);
    vec3 img = texture2D(map, imageUv).rgb;

    float inside = 1.0 - smoothstep(-0.0015, 0.0015, d);
    float ring = 1.0 - smoothstep(0.0, 0.010, abs(d));
    float halo = exp(-max(d, 0.0) * 22.0) * step(0.0, d);

    vec3 color = img * uBrightness * inside;
    color += uAccent * ring * (0.35 + 0.65 * uGlow);
    color += uAccent * halo * uGlow * 0.55;

    float alpha = inside + ring * (0.4 + 0.6 * uGlow) + halo * uGlow * 0.85;
    alpha = clamp(alpha, 0.0, 1.0) * uOpacity;

    gl_FragColor = vec4(color, alpha);
    #include <fog_fragment>
  }
`;

/** Resting accent glow level; hover and focus animate around this. */
export const BASE_GLOW = 0.4;

export interface CardUniforms {
  map: { value: THREE.Texture };
  uAccent: { value: THREE.Color };
  uBrightness: { value: number };
  uGlow: { value: number };
  uOpacity: { value: number };
  uAspect: { value: number };
  [uniform: string]: THREE.IUniform;
}

/** Dark manifest accents stay true on the detail page, but a glow needs
 *  luminance, so lift dark colours before they hit the shader. */
export function glowColor(hex: string): THREE.Color {
  const c = new THREE.Color(hex);
  const hsl = { h: 0, s: 0, l: 0 };
  c.getHSL(hsl);
  c.setHSL(hsl.h, Math.max(hsl.s, 0.45), Math.max(hsl.l, 0.58));
  return c;
}

export function createCardMaterial(texture: THREE.Texture, accentHex: string, aspect: number) {
  const uniforms: CardUniforms = {
    map: { value: texture },
    uAccent: { value: glowColor(accentHex) },
    uBrightness: { value: 1 },
    uGlow: { value: BASE_GLOW },
    uOpacity: { value: 1 },
    uAspect: { value: aspect },
  };
  const material = new THREE.ShaderMaterial({
    uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, uniforms]),
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    fog: true,
  });
  // merge clones uniform values; re-point the texture afterwards
  (material.uniforms.map as { value: THREE.Texture }).value = texture;
  return material;
}
