# Taku Carousel

A portfolio gallery on the inside of a sphere. The viewer stands at the centre, drags to look around with weighted inertia, and clicks a card to open its spec page. Nineteen projects: nine real, ten concept pitches for Zimbabwean SMEs. Content lives in `Gallery Manifest.md` and is mirrored in `src/data/cards.ts`.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
```

Production:

```bash
npm run build      # type-checks, bundles to dist/
npm run preview    # serves dist/ at http://localhost:4173
```

## Routes

- `#/` the sphere
- `#/projects` plain responsive grid of all cards, same data and links, no WebGL needed
- `#/p/<id>` detail page for one card

## Stack

Vite, TypeScript, Three.js, GSAP, Lenis. No framework. Fonts are Syne and Inter, self-hosted via Fontsource. Lenis drives the detail rail and grid scrolling; the sphere drag uses the same damped-lerp maths tuned by hand in `src/controls/orbitDrag.ts`.

## Asset pipeline

Card images are 1280x800 WebP in `public/cards/`, produced by scripts:

```bash
node scripts/capture-live.mjs   # screenshots the live deployments
node scripts/mockup-shot.mjs    # renders mockups/*.html to PNG
node scripts/to-webp.mjs        # converts capture-src/*.png to public/cards/*.webp
```

Concept cards and unbuildable repos use hand-designed HTML mockups in `mockups/`, rendered in a device frame. Live cards are real screenshots. The status tag on each card tells the truth either way.

## Where things live

- `src/scene/` stage, Fibonacci sphere, card shader, hover raycasts, post-processing, intro
- `src/controls/orbitDrag.ts` the inertial drag feel, the heart of the site
- `src/ui/` preloader, cursor, HUD, detail overlay, grid
- `src/data/cards.ts` the nineteen cards, generated from the manifest
- `scripts/` capture and verification tooling (snap.mjs takes screenshots, fps-test.mjs measures drag FPS on the real GPU)
