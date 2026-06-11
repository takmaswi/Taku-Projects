# Taku Carousel: gallery manifest

The content blueprint for the spherical portfolio gallery. Nineteen cards: nine real projects and ten concept apps built for Zimbabwean SMEs. Every card carries a status tag so nothing pretends to be more finished than it is.

Stack for the site itself: Three.js for the sphere, GSAP for the animation, Lenis for the drag easing. Dark cinematic theme. Cards sit on a Fibonacci sphere, you drag to look around, and clicking a card opens its spec page.

## Status tags

- **Live**: deployed and reachable at a URL.
- **Built**: real code, runs locally, not deployed.
- **Concept**: not built yet. A pitch for what I can deliver for a client.

The honesty lives in the tag, not the visual. Concept cards are designed to look as polished as the real ones.

## Visual approach per card

- Live and Built cards use a real screenshot, captured from the running app.
- Concept cards use a hand designed mockup screen inside a light device frame. Real type, real layout, no AI generated UI.

---

# Part one: real projects

## 1. Svika

Status: Live
Pitch: Digital tickets and trip planning for Harare's kombi network.
Spec: Svika turns the informal kombi system into something you can search, ticket, and track. Riders plan a trip, see the route on a map, and pay for a digital ticket instead of fumbling for change. Built for the GDG Harare Build with AI showcase.
Stack: Next.js 16, Supabase (Postgres), Mapbox, Vercel.
Links: repo (public), live at svika.vercel.app.
Accent: forest green #1F4D2E.
Visual: screenshot of the trip preview map.

## 2. Nuvia Student Hub

Status: Live
Pitch: A student accommodation marketplace that swaps the fear of the search for confidence.
Spec: Three portals in one platform. Students search verified rooms with filters tuned to Zimbabwe, like backup power and borehole water. Landlords manage listings and pass KYC. Admins moderate and approve. Row level security and KYC sit underneath the whole thing.
Stack: Next.js 16, TypeScript, Tailwind, Supabase, Resend, Africa's Talking.
Links: repo (public), live at nuvia-student-hub.vercel.app.
Accent: Nuvia gold #B8924B on navy.
Visual: screenshot of the student search with filters open.

## 3. Best Bud

Status: Live
Pitch: A tactile editorial storefront for a South African wellness brand, with checkout over WhatsApp.
Spec: A single scrolling page built like a paper zine rather than a stock store. The cart compiles into a pre filled WhatsApp message to the business line, so there is no card processor in the way. The design language is organic brutalism: handwritten headers, raw paper texture, film grain.
Stack: Next.js, Tailwind, WhatsApp deeplink checkout.
Links: repo, live demo.
Accent: sage green #7C8B6F.
Visual: screenshot of the hero and apothecary sections.

## 4. Fairvalue Task Tracker

Status: Live
Pitch: A Kanban task board built for an accounting firm.
Spec: Admins create tasks and clients; employees claim work from an open column and move it through to review. Role based access keeps the two sides apart, and the admin signs off or sends work back with feedback.
Stack: HTML, JavaScript, Firebase auth and database.
Links: repo (public), live demo.
Accent: teal #2A7F7F.
Visual: screenshot of the Kanban board.

## 5. Taku Payroll

Status: Built
Pitch: The AI powered payroll engine for Zimbabwean businesses, dual currency and ZIMRA aligned.
Spec: Most small employers run payroll in spreadsheets or pay for tools that ship their data abroad. Taku Payroll does the dual currency maths the way ZIMRA expects, taxes each currency in its own stream, and computes PAYE, NSSA, the AIDS levy, and NEC levies per employee. Every figure has a show working control that opens the exact formula behind it. The data never has to leave the country.
Stack: TypeScript, Next.js, local first data layer.
Links: repo (private).
Accent: emerald #1FA67A.
Visual: screenshot of a payroll run with the show working panel open.

## 6. Taku AI

Status: Built
Pitch: An offline first AI platform that keeps proprietary data on local hardware.
Spec: A native desktop app that runs a local language model and a vector store, so a business can ask questions of its own documents without anything crossing the network. Document analysis and retrieval sit behind a clean desktop interface.
Stack: Tauri 2 (Rust), React 19, Vite, FastAPI, Ollama (Mistral 7B), ChromaDB.
Links: repo (public).
Accent: violet #7C5CFF.
Visual: screenshot of the chat answering from an uploaded document.

## 7. HR Intelligence

Status: Built
Pitch: Air gapped HR analytics for workforce planning and attrition risk.
Spec: An enterprise HR tool that ingests workforce data, validates it against a defined org taxonomy, and turns it into retention and flight risk insight. It binds to localhost only, with no cloud dependency, so sensitive staff data stays inside the building. A guided wizard sets up regions, branches, and grading benchmarks.
Stack: FastAPI, DuckDB, React, Vite, shadcn UI, XGBoost, SHAP.
Links: repo (private).
Accent: steel grey #6B7280.
Visual: screenshot of the CEO dashboard.

## 8. TAKU Dzidza

Status: Built
Pitch: A personal tutor that reads a homework photo and works the maths out.
Spec: Snap a photo of a problem and the app runs OCR to pull the question, routes it to a symbolic maths engine for an exact answer, and writes the working into a structured note. It separates real computation from conversation so the answers stay correct rather than guessed.
Stack: FastAPI, SymPy, OCR pipeline, local LLM via Ollama, Obsidian output.
Links: repo (private).
Accent: amber #E8A33D.
Visual: mockup of the photo to solution flow (no clean screenshot yet).

## 9. Takunda 3D Portfolio

Status: Live
Pitch: A photorealistic 3D portfolio with a rotating mud hut that turns as you scroll.
Spec: The proof that the carousel itself is in reach. A 3D model sits at the centre and rotates through four sections as you scroll, lit with studio HDRI, on a dark glassmorphism theme. Same family of tools as this gallery: Three.js and GSAP.
Stack: Next.js 15, TypeScript, Three.js, GSAP ScrollTrigger.
Links: repo (private), live at takunda-seven.vercel.app.
Accent: warm gold #C9A24B on near black.
Visual: screenshot of the 3D hut mid rotation.

---

# Part two: concept apps for Zimbabwean SMEs

These target the segments that actually fill the market: retail and trade, beauty, food, informal finance, agriculture, and community groups. The common thread is a market reality. Most of these businesses run on patchy power and data, so every concept is mobile first, works offline, and pays through EcoCash and WhatsApp rather than a card machine.

Shared stack proposal for all concepts: Next.js as a progressive web app, Supabase, offline sync, EcoCash and WhatsApp integration. Each gets a hand designed mockup in a phone frame.

## 10. Salon and Barber Manager

Status: Concept
Pitch: Bookings, stylist commissions, and stock for salons and barbershops.
Spec: Clients book a slot and get a WhatsApp reminder. The owner sees the day's diary, splits commission per stylist automatically, and tracks product stock so the relaxer never runs out mid Saturday.
Accent: rose #C2466B.

## 11. Electronics Shop POS

Status: Concept
Pitch: A point of sale for phone and electronics shops, with serial and warranty tracking.
Spec: Ring up a sale, record the IMEI or serial against the customer, and the warranty clock starts on its own. Handles layby and instalment sales, which is how most phones actually get bought, and warns when stock runs low.
Accent: electric blue #2D7FF9.

## 12. Tuckshop Credit Book

Status: Concept
Pitch: The digital chikwereti book. Track who owes what and nudge them to pay.
Spec: The corner shop sells on credit and tracks it in a notebook that gets lost or soaked. This replaces it: log a credit sale against a customer, send a polite WhatsApp reminder when it is due, and see the day's stock and cash at a glance.
Accent: orange #E8742C.

## 13. Restaurant and Takeaway Ordering

Status: Concept
Pitch: A WhatsApp first menu and order queue with EcoCash checkout.
Spec: Customers browse the menu and order without an app install. Orders land in a kitchen queue, payment clears through EcoCash, and delivery gets handed off. The Best Bud checkout idea, pointed at food.
Accent: tomato red #E84C30.

## 14. Mukando and Stokvel Manager

Status: Concept
Pitch: Run a savings circle without the paper ledger and the arguments.
Spec: A rotating savings group app. Members see who has paid in, whose turn it is to collect, and the running ledger. Reminders go out before each round so nobody chases anyone by hand. Informal savings circles are everywhere and almost none of them have software.
Accent: gold #D4AF37.

## 15. Burial Society Manager

Status: Concept
Pitch: Member dues, beneficiaries, and claim payouts for a burial society.
Spec: Nearly every community runs one, all of it on paper. This tracks monthly contributions, keeps beneficiary records straight, and processes a claim when a member needs it, so the books are clear when it matters most.
Accent: slate indigo #4B5170.

## 16. Poultry and Broiler Manager

Status: Concept
Pitch: Run a broiler batch by the numbers.
Spec: Track each batch from day old chick to sale. Log feed and mortality, watch the cost per bird, and record sales, so the farmer knows whether the batch actually made money instead of guessing.
Accent: warm yellow #E0B33A.

## 17. Crop and Input Tracker

Status: Concept
Pitch: Season planning and input costs for maize and tobacco growers.
Spec: Plan the season, record what went in (seed, fertiliser, chemicals) and what it cost, then log yield per hectare against it. Built with contract farming records in mind, where the paperwork decides whether you get paid properly.
Accent: maize green #6FA82C.

## 18. Cattle and Livestock Register

Status: Concept
Pitch: A herd register for breeding, health, and sales.
Spec: Keep the herd on record: each animal, breeding and calving history, vaccination and dipping dates, and sale records. Cattle are both savings and business across rural Zimbabwe, and this keeps that wealth properly accounted for.
Accent: ochre brown #9A6B3F.

## 19. Church Management System

Status: Concept
Pitch: Membership, giving, and groups for a church running on notebooks.
Spec: A membership roll, a tithes and offerings ledger, cell group structure, and service scheduling, with announcements going out over WhatsApp. Most assemblies track all of this by hand. This puts it in one place the leadership can actually see.
Accent: deep purple #6B3FA0.

---

# Card data shape

Each card maps to one object the gallery reads:

- id
- title
- status (live / built / concept)
- pitch (one line, shown on hover)
- description (the spec page body)
- stack (array of tech names)
- repoUrl (optional)
- liveUrl (optional)
- accent (hex)
- image (screenshot or mockup path)

Nineteen of these in an array is the whole content layer. The build brief covers how the sphere reads them.
