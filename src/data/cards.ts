export type CardStatus = 'live' | 'built' | 'concept';

export interface Card {
  id: string;
  title: string;
  status: CardStatus;
  pitch: string;
  description: string;
  stack: string[];
  repoUrl?: string;
  liveUrl?: string;
  accent: string;
  image: string;
}

/**
 * Generated from Gallery Manifest.md. The manifest is the single source
 * of truth; do not edit copy here without updating it there.
 *
 * Sourcing notes:
 * - Fairvalue is tagged Live in the manifest but no public deployment URL
 *   could be found (Firebase hosting 404s), so liveUrl is omitted.
 * - Takunda 3D Portfolio's manifest URL (takunda-seven.vercel.app) returns
 *   DEPLOYMENT_NOT_FOUND, so liveUrl is omitted.
 * - HR Intelligence's repo is publicly visible on GitHub even though the
 *   manifest says private, so the URL is included.
 */
export const cards: Card[] = [
  {
    id: 'svika',
    title: 'Svika',
    status: 'live',
    pitch: "Digital tickets and trip planning for Harare's kombi network.",
    description:
      'Svika turns the informal kombi system into something you can search, ticket, and track. Riders plan a trip, see the route on a map, and pay for a digital ticket instead of fumbling for change. Built for the GDG Harare Build with AI showcase.',
    stack: ['Next.js 16', 'Supabase', 'Mapbox', 'Vercel'],
    repoUrl: 'https://github.com/takmaswi/Svika',
    liveUrl: 'https://svika.vercel.app',
    accent: '#1F4D2E',
    image: '/cards/svika.webp',
  },
  {
    id: 'nuvia',
    title: 'Nuvia Student Hub',
    status: 'live',
    pitch: 'A student accommodation marketplace that swaps the fear of the search for confidence.',
    description:
      'Three portals in one platform. Students search verified rooms with filters tuned to Zimbabwe, like backup power and borehole water. Landlords manage listings and pass KYC. Admins moderate and approve. Row level security and KYC sit underneath the whole thing.',
    stack: ['Next.js 16', 'TypeScript', 'Tailwind', 'Supabase', 'Resend', "Africa's Talking"],
    repoUrl: 'https://github.com/takmaswi/Nuvia-Student-Hub',
    liveUrl: 'https://nuvia-student-hub.vercel.app',
    accent: '#B8924B',
    image: '/cards/nuvia.webp',
  },
  {
    id: 'best-bud',
    title: 'Best Bud',
    status: 'live',
    pitch: 'A tactile editorial storefront for a South African wellness brand, with checkout over WhatsApp.',
    description:
      'A single scrolling page built like a paper zine rather than a stock store. The cart compiles into a pre filled WhatsApp message to the business line, so there is no card processor in the way. The design language is organic brutalism: handwritten headers, raw paper texture, film grain.',
    stack: ['Next.js', 'Tailwind', 'WhatsApp deeplink checkout'],
    liveUrl: 'https://best-bud.vercel.app',
    accent: '#7C8B6F',
    image: '/cards/best-bud.webp',
  },
  {
    id: 'fairvalue',
    title: 'Fairvalue Task Tracker',
    status: 'live',
    pitch: 'A Kanban task board built for an accounting firm.',
    description:
      'Admins create tasks and clients; employees claim work from an open column and move it through to review. Role based access keeps the two sides apart, and the admin signs off or sends work back with feedback.',
    stack: ['HTML', 'JavaScript', 'Firebase'],
    repoUrl: 'https://github.com/takmaswi/Fairvalue-Tracker',
    accent: '#2A7F7F',
    image: '/cards/fairvalue.webp',
  },
  {
    id: 'taku-payroll',
    title: 'Taku Payroll',
    status: 'built',
    pitch: 'The AI powered payroll engine for Zimbabwean businesses, dual currency and ZIMRA aligned.',
    description:
      'Most small employers run payroll in spreadsheets or pay for tools that ship their data abroad. Taku Payroll does the dual currency maths the way ZIMRA expects, taxes each currency in its own stream, and computes PAYE, NSSA, the AIDS levy, and NEC levies per employee. Every figure has a show working control that opens the exact formula behind it. The data never has to leave the country.',
    stack: ['TypeScript', 'Next.js', 'Local-first data layer'],
    accent: '#1FA67A',
    image: '/cards/taku-payroll.webp',
  },
  {
    id: 'taku-ai',
    title: 'Taku AI',
    status: 'built',
    pitch: 'An offline first AI platform that keeps proprietary data on local hardware.',
    description:
      'A native desktop app that runs a local language model and a vector store, so a business can ask questions of its own documents without anything crossing the network. Document analysis and retrieval sit behind a clean desktop interface.',
    stack: ['Tauri 2 (Rust)', 'React 19', 'Vite', 'FastAPI', 'Ollama (Mistral 7B)', 'ChromaDB'],
    repoUrl: 'https://github.com/takmaswi/Taku-AI',
    accent: '#7C5CFF',
    image: '/cards/taku-ai.webp',
  },
  {
    id: 'hr-intelligence',
    title: 'HR Intelligence',
    status: 'built',
    pitch: 'Air gapped HR analytics for workforce planning and attrition risk.',
    description:
      'An enterprise HR tool that ingests workforce data, validates it against a defined org taxonomy, and turns it into retention and flight risk insight. It binds to localhost only, with no cloud dependency, so sensitive staff data stays inside the building. A guided wizard sets up regions, branches, and grading benchmarks.',
    stack: ['FastAPI', 'DuckDB', 'React', 'Vite', 'shadcn UI', 'XGBoost', 'SHAP'],
    repoUrl: 'https://github.com/takmaswi/pmrc-hr-intelligence',
    accent: '#6B7280',
    image: '/cards/hr-intelligence.webp',
  },
  {
    id: 'taku-dzidza',
    title: 'TAKU Dzidza',
    status: 'built',
    pitch: 'A personal tutor that reads a homework photo and works the maths out.',
    description:
      'Snap a photo of a problem and the app runs OCR to pull the question, routes it to a symbolic maths engine for an exact answer, and writes the working into a structured note. It separates real computation from conversation so the answers stay correct rather than guessed.',
    stack: ['FastAPI', 'SymPy', 'OCR pipeline', 'Ollama', 'Obsidian output'],
    accent: '#E8A33D',
    image: '/cards/taku-dzidza.webp',
  },
  {
    id: 'takunda-3d',
    title: 'Takunda 3D Portfolio',
    status: 'live',
    pitch: 'A photorealistic 3D portfolio with a rotating mud hut that turns as you scroll.',
    description:
      'The proof that the carousel itself is in reach. A 3D model sits at the centre and rotates through four sections as you scroll, lit with studio HDRI, on a dark glassmorphism theme. Same family of tools as this gallery: Three.js and GSAP.',
    stack: ['Next.js 15', 'TypeScript', 'Three.js', 'GSAP ScrollTrigger'],
    accent: '#C9A24B',
    image: '/cards/takunda-3d.webp',
  },
  {
    id: 'salon-manager',
    title: 'Salon and Barber Manager',
    status: 'concept',
    pitch: 'Bookings, stylist commissions, and stock for salons and barbershops.',
    description:
      "Clients book a slot and get a WhatsApp reminder. The owner sees the day's diary, splits commission per stylist automatically, and tracks product stock so the relaxer never runs out mid Saturday.",
    stack: ['Next.js PWA', 'Supabase', 'Offline sync', 'EcoCash', 'WhatsApp'],
    accent: '#C2466B',
    image: '/cards/salon-manager.webp',
  },
  {
    id: 'electronics-pos',
    title: 'Electronics Shop POS',
    status: 'concept',
    pitch: 'A point of sale for phone and electronics shops, with serial and warranty tracking.',
    description:
      'Ring up a sale, record the IMEI or serial against the customer, and the warranty clock starts on its own. Handles layby and instalment sales, which is how most phones actually get bought, and warns when stock runs low.',
    stack: ['Next.js PWA', 'Supabase', 'Offline sync', 'EcoCash', 'WhatsApp'],
    accent: '#2D7FF9',
    image: '/cards/electronics-pos.webp',
  },
  {
    id: 'tuckshop-credit',
    title: 'Tuckshop Credit Book',
    status: 'concept',
    pitch: 'The digital chikwereti book. Track who owes what and nudge them to pay.',
    description:
      "The corner shop sells on credit and tracks it in a notebook that gets lost or soaked. This replaces it: log a credit sale against a customer, send a polite WhatsApp reminder when it is due, and see the day's stock and cash at a glance.",
    stack: ['Next.js PWA', 'Supabase', 'Offline sync', 'EcoCash', 'WhatsApp'],
    accent: '#E8742C',
    image: '/cards/tuckshop-credit.webp',
  },
  {
    id: 'restaurant-orders',
    title: 'Restaurant and Takeaway Ordering',
    status: 'concept',
    pitch: 'A WhatsApp first menu and order queue with EcoCash checkout.',
    description:
      'Customers browse the menu and order without an app install. Orders land in a kitchen queue, payment clears through EcoCash, and delivery gets handed off. The Best Bud checkout idea, pointed at food.',
    stack: ['Next.js PWA', 'Supabase', 'Offline sync', 'EcoCash', 'WhatsApp'],
    accent: '#E84C30',
    image: '/cards/restaurant-orders.webp',
  },
  {
    id: 'mukando',
    title: 'Mukando and Stokvel Manager',
    status: 'concept',
    pitch: 'Run a savings circle without the paper ledger and the arguments.',
    description:
      'A rotating savings group app. Members see who has paid in, whose turn it is to collect, and the running ledger. Reminders go out before each round so nobody chases anyone by hand. Informal savings circles are everywhere and almost none of them have software.',
    stack: ['Next.js PWA', 'Supabase', 'Offline sync', 'EcoCash', 'WhatsApp'],
    accent: '#D4AF37',
    image: '/cards/mukando.webp',
  },
  {
    id: 'burial-society',
    title: 'Burial Society Manager',
    status: 'concept',
    pitch: 'Member dues, beneficiaries, and claim payouts for a burial society.',
    description:
      'Nearly every community runs one, all of it on paper. This tracks monthly contributions, keeps beneficiary records straight, and processes a claim when a member needs it, so the books are clear when it matters most.',
    stack: ['Next.js PWA', 'Supabase', 'Offline sync', 'EcoCash', 'WhatsApp'],
    accent: '#4B5170',
    image: '/cards/burial-society.webp',
  },
  {
    id: 'poultry',
    title: 'Poultry and Broiler Manager',
    status: 'concept',
    pitch: 'Run a broiler batch by the numbers.',
    description:
      'Track each batch from day old chick to sale. Log feed and mortality, watch the cost per bird, and record sales, so the farmer knows whether the batch actually made money instead of guessing.',
    stack: ['Next.js PWA', 'Supabase', 'Offline sync', 'EcoCash', 'WhatsApp'],
    accent: '#E0B33A',
    image: '/cards/poultry.webp',
  },
  {
    id: 'crop-tracker',
    title: 'Crop and Input Tracker',
    status: 'concept',
    pitch: 'Season planning and input costs for maize and tobacco growers.',
    description:
      'Plan the season, record what went in (seed, fertiliser, chemicals) and what it cost, then log yield per hectare against it. Built with contract farming records in mind, where the paperwork decides whether you get paid properly.',
    stack: ['Next.js PWA', 'Supabase', 'Offline sync', 'EcoCash', 'WhatsApp'],
    accent: '#6FA82C',
    image: '/cards/crop-tracker.webp',
  },
  {
    id: 'livestock',
    title: 'Cattle and Livestock Register',
    status: 'concept',
    pitch: 'A herd register for breeding, health, and sales.',
    description:
      'Keep the herd on record: each animal, breeding and calving history, vaccination and dipping dates, and sale records. Cattle are both savings and business across rural Zimbabwe, and this keeps that wealth properly accounted for.',
    stack: ['Next.js PWA', 'Supabase', 'Offline sync', 'EcoCash', 'WhatsApp'],
    accent: '#9A6B3F',
    image: '/cards/livestock.webp',
  },
  {
    id: 'church',
    title: 'Church Management System',
    status: 'concept',
    pitch: 'Membership, giving, and groups for a church running on notebooks.',
    description:
      'A membership roll, a tithes and offerings ledger, cell group structure, and service scheduling, with announcements going out over WhatsApp. Most assemblies track all of this by hand. This puts it in one place the leadership can actually see.',
    stack: ['Next.js PWA', 'Supabase', 'Offline sync', 'EcoCash', 'WhatsApp'],
    accent: '#6B3FA0',
    image: '/cards/church.webp',
  },
];

export const statusLabel: Record<CardStatus, string> = {
  live: 'Live',
  built: 'Built',
  concept: 'Concept',
};
