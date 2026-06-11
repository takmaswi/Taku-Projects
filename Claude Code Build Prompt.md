# Claude Code build prompt: Taku Carousel

How to run this. Open PowerShell in this folder:

```powershell
cd "C:\Users\Dell\OneDrive\Documents\Idea Hub\Claude\Taku Carousel"
claude --dangerously-skip-permissions
```

Then paste everything below the line as your first message.

---

You are a senior creative developer building a portfolio website that has to function as a visual showpiece. The whole point of the site is to prove design and engineering skill in one shot, so polish, motion, and performance matter as much as the content.

## The experience to recreate

Build an inside a sphere image gallery, modelled on the feel of phantom.land. The viewer sits at the centre of a sphere and looks out at a gallery of cards mapped onto the inner surface. They left click and drag to look around, with weighted, inertial easing in the style of Lenis smooth scroll, so the gallery keeps gliding after the mouse lets go and settles gently. Clicking a card animates a detail page into view. The sphere is the hero. The detail page can stay close to a clean template. Spend the effort on the gallery.

## Stack

- Vite as the build tool and dev server.
- Three.js for the 3D scene.
- GSAP for all choreographed animation, including the card to detail transition and the intro.
- Lenis for the drag and scroll easing feel.
- Plain TypeScript. No React. Keep it lean.

Pull Three.js, GSAP, and Lenis from npm, not a CDN.

## Content source, read this first

All nineteen cards are defined in `Gallery Manifest.md` in this folder. Read it before writing any code. It is the single source of truth for titles, status tags, pitches, spec descriptions, tech stacks, links, and accent colours. Do not invent project data. If something is missing, ask me rather than guessing.

Each card has a status tag:

- Live: deployed, has a real URL.
- Built: real code, runs locally, not deployed.
- Concept: not built yet, a pitch for a client.

## Gathering the card images

The manifest names a screenshot or a mockup for each card. Produce them like this.

1. Authenticate GitHub so you can read the private repos:
   ```powershell
   gh auth login
   ```
2. For Live cards, capture a screenshot of the live URL with a headless browser (Playwright or Puppeteer, your call). Use a 16:10 crop, consistent across the set.
3. For Built cards, clone or open the repo, install, run the dev server, and capture the running app the same way. If a build will not come up cleanly, tell me which one and move on with a placeholder rather than burning time.
4. For Concept cards and any Built card with no clean capture (TAKU Dzidza is one), design a mockup screen yourself: a single representative view built in clean HTML and CSS using the card's accent colour and real, sensible labels. No AI generated UI imagery, no lorem ipsum. Render it inside a light phone or browser frame and screenshot that.
5. Save all images to `public/cards/` at matching sizes, compressed as WebP. Consistent dimensions across every card. The sphere is unforgiving, so one oddly sized image ruins the grid.

## Card data model

Generate `src/data/cards.ts` from the manifest. One array of objects:

```ts
type Card = {
  id: string
  title: string
  status: 'live' | 'built' | 'concept'
  pitch: string          // one line, shown on hover
  description: string    // spec page body
  stack: string[]
  repoUrl?: string
  liveUrl?: string
  accent: string         // hex
  image: string          // path under /public/cards
}
```

## The gallery mechanic

This is where the work goes. Get it right.

1. Distribute the cards on the inner surface of a sphere using a Fibonacci sphere algorithm, so they spread evenly instead of clumping at the poles. Each card is a textured plane.
2. Put the camera at the centre. Dragging rotates the view, it does not move the camera through space. Rotating the whole card group is the simplest stable approach.
3. Inertial drag. On pointer move, feed the delta into an angular velocity. On release, let the velocity decay with damping so the gallery keeps turning and eases to rest. Tune the damping until it feels heavy and smooth, like Lenis. This is the single most important feel of the site.
4. Curve the cards to the sphere. Orient each plane along the sphere normal so it sits on the surface rather than floating flat. This reads far better than billboarding.
5. Hover state. Raycast from the camera through the pointer every frame. The card under the cursor brightens and scales up slightly, neighbours dim a touch, and the custom cursor changes. Show the card's one line pitch on hover.
6. Click to open. On click, GSAP animates the chosen card toward the camera while the rest of the sphere fades and blurs back, then the detail page fades in over the top. Reverse the whole thing on close.

## Visual design system

Dark and cinematic.

- Background near black, not pure black. Around #0B0B0D.
- Each card carries its accent colour from the manifest as a subtle glow or border, so the sphere reads as a constellation of distinct projects rather than a uniform grid.
- Post processing is what sells the premium feel. Add restrained bloom, a vignette, and a touch of chromatic aberration at the edges. Keep it subtle. If it looks like a filter, dial it back.
- Depth falloff. Cards further away recede with fog or reduced opacity, to give real depth.
- A fine film grain overlay across the whole canvas.
- A custom cursor that grows over interactive cards.
- A preloader tied to real texture loading progress, then a GSAP intro where the camera eases back and the sphere settles into place.
- Type: one clean display face and one neutral sans. Suggest a pairing and show it to me before committing.

## The detail or spec page

Keep it simple but sharp. For the clicked card show: title, status tag, the description, the tech stack as small chips, and buttons for the live link and the repo where they exist. Concept cards show a "Concept" tag and no repo button. Animate it in with GSAP, give it a clear close that returns to the sphere at the same card.

## Status tags

Render the tag on every card and on the detail page. Live, Built, Concept. This is a credibility feature, so make it legible, not hidden. The concept cards must look as polished as the real ones. The tag is what tells the truth, not the quality of the visual.

## Accessibility and responsive fallback

The sphere is immersive but hard to scan and hostile to search engines, so build a plain fallback too: a "view all projects" route that lists every card as a normal responsive grid with the same data and links. Make it reachable from the gallery. On touch devices, drag maps to one finger swipe with the same inertia. Make sure nothing is keyboard trapped.

## Performance targets

- Hold 60fps while dragging on a normal laptop.
- Set texture anisotropy to the max the GPU allows and generate mipmaps, or angled cards look soft.
- Compress every texture. Lazy load detail page assets.
- Dispose Three.js geometries, materials, and textures on teardown so memory does not climb.

## Build in phases, show me each one

Do not try to land the whole thing in one pass. Work in order and pause for a look between phases.

1. Vite and TypeScript scaffold, dependencies, empty Three.js scene with a single test plane.
2. Fibonacci sphere of placeholder planes, camera at centre.
3. Drag to rotate with inertial damping. Tune the feel before moving on.
4. Load the real card textures from the data file.
5. Raycast hover states and the custom cursor.
6. Click to detail page transition, both directions.
7. The detail page and the all projects fallback.
8. Post processing, grain, preloader, intro animation.
9. Capture and wire in the real screenshots and mockups.
10. Performance pass and polish.

## Verify with Chrome DevTools

After each visual phase, open the site in Chrome and check your own work rather than assuming it landed. Take a screenshot and compare it to the phantom.land reference for spacing, depth, and motion. Use the Performance panel and the FPS meter to confirm the drag holds 60fps, and check the layout in the device toolbar at mobile width. Iterate on spacing, easing, and colour until it matches the intent. Report what you changed.

## Copy and voice rules

Any text you write for the site, including spec page copy, headings, and labels, follows these rules:

- No em dashes and no en dashes anywhere, in body text or headings. Use commas, colons, or two sentences.
- Plain, direct voice. No marketing filler, no words like delve, leverage, seamless, vibrant, testament, or showcase.
- Do not pad. If a line says nothing, cut it.
- Use the descriptions from the manifest as written. Do not rewrite them into AI sounding prose.

## Constraints

- Read the manifest and use its real data. Do not fabricate projects, links, or stacks.
- Ask before adding a dependency that is not in the stack above.
- Keep everything in this folder.

Start with phase one and the type pairing suggestion, then wait for my go ahead.
