# 🇮🇳 BharatVerse (Personal Edition)

A heritage & cultural experience platform for India — immersive 360° tours, an
AI cultural guide, interactive quizzes, and (new in this edition) a working
**Trip Planner** that generates day-by-day itineraries with an editable budget
breakdown.

**Live demo (this fork):** https://bharatverse-personal.vercel.app
**Original live deployment:** https://bharat-verse-theta.vercel.app (owned by Team Netaji Ninjas)

---

## Problem statement

India's cultural heritage is scattered across thousands of monuments,
festivals, art forms and traditions, but there is no single, engaging place
for a traveller or student to explore them digitally, test their knowledge,
and *plan an actual visit*. BharatVerse targets:

- Students who want to learn Indian heritage interactively (quiz, storytelling).
- Travellers who want to discover lesser-known sites and now — plan a visit.
- Culture enthusiasts exploring art forms and festivals by state.

This edition was built for the SIH problem statement **SIH25130 — "Swadeshi
for Atmanirbhar Bharat – Heritage & Culture"**.

---

## Original project vs. this edition

BharatVerse was created for Smart India Hackathon 2025 by **Team Netaji
Ninjas**:

- **Aryan** (team leader) — https://github.com/Aryan-s16
- Garv Bahl — https://github.com/garvbahl37-gif
- Rahul — https://github.com/Rahul04-alt
- Dhruv Kumar — https://github.com/kumardhruv88
- Lucky Kumar Gupta — https://github.com/lucky15426
- Mehak — https://github.com/mehaksts2106

All original source, data, design and features remain the work of that team;
their copyright and credit are fully preserved here. This repository is a
personal learning fork maintained by **Arman Yadav**
(github.com/armanyadav), containing clearly-listed improvements on top of the
original code. The original SIH presentation is kept in
`SIH- Presentation.pdf`.

---

## Features

### From the original project (retained and tested)

- 🏛️ **Heritage sites catalog** (60 sites) with images, architecture,
  timelines, significance, videos and audiobook narration
- 🗺️ **Interactive map** (Leaflet) with heritage-site markers and geolocation
- 🍞 **360° virtual tours** (PanoViewer + AirPano embeds)
- 🤖 **AI cultural guide** chat (gradio client / Gemini-backed, optional keys)
- 🏆 **Cultural quiz** with scoring and progress tracking
- 🎉 **Festivals** and 🪕 **arts & living traditions** browsing
- 💠 **Hidden Gems** community submissions (Supabase-backed, optional)
- 🎧 Audio stories, bookmarking, localStorage progress persistence,
  search, and an interactive storytelling experience

### New in this edition (my contributions)

1. **🧭 Trip Planner (`TripPlannerPage` + `src/utils/tripPlanner.js`)** — the
   headline addition:
   - Search across the full 60-site heritage dataset and pick sites; selected
     sites keep an ordering number to build a route.
   - Generates a **day-by-day itinerary** that groups sites by state
     (pure functions: `groupByState`, `buildItinerary`, `generatePlan`).
   - **Budget breakdown** for lodging, food, intercity/local transport and
     entry tickets; totals per traveller count and travel style
     (budget / standard / premium). All costs are honest, editable
     assumptions — clearly labelled, not fake official tariffs.
   - **Export**: download the itinerary as Markdown (`Blob` + object URL),
     copy to clipboard, and save/reload up to 5 plans
     (localStorage persistence).
   - Full validation (trip length 1–30 days, 1–20 travellers) with inline
     error alerts and toast feedback.
2. **Navigation bug fixes** — all 8 footer links were dead `href="#"`;
   they now navigate to real pages, including the new Trip Planner.
3. **Mobile header overflow fix** — on phone widths the hamburger menu
   rendered off-screen (measured at x=438px in a 312px viewport). The header
   now adapts: compact logo, condensed actions, and the menu button is fully
   visible at 312px.
4. **Honesty fixes on the homepage** — removed the fabricated "50,000+
   explorers" animated stat and the decorative newsletter signup form that
   had no backend; replaced with real CTAs (quiz / planner).
5. **Documentation** — this README, `CHANGELOG.md`, and `.env.example`
   cleanup (placeholders only).

---

## Technology stack

| Layer | Technology |
|---|---|
| Framework | React 19 + Vite 7 (JavaScript, JSX) |
| Styling | Tailwind CSS 3 with a custom heritage theme |
| Routing | State-based page switching (`App.jsx` `currentPage`) — not react-router by default |
| State | React hooks + Zustand + React Query v3 |
| Maps | Leaflet + react-leaflet; Google Maps loader |
| Media | `@gradio/client` (AI), Supabase storage (uploads) |
| Lint | ESLint 9 flat config |

---

## Architecture

```mermaid
flowchart LR
  subgraph Client - React SPA (Vite)
    A[App.jsx - page router + bookmarks + progress] --> P1[HomePage]
    A --> P2[Heritage / States / Festivals / Arts]
    A --> P3[TripPlannerPage]
    A --> P4[Quiz / Chat / Map / 360 Tours]
    P3 --> T[tripPlanner.js - pure planning engine]
    T --> D[(src/data/heritage.json - 60 sites)]
  end
  subgraph Optional external services
    S[(Supabase - uploads, hidden gems)]
    G[Gemini / Gradio AI]
    M[Google Maps / Leaflet tiles]
  end
  P1 --> M
  P4 --> G
  A --> S
  A --> L[(localStorage - bookmarks, plans, progress)]
  T --> L
```

Data flow for the new planner: `selected site ids + trip config` →
`generatePlan()` (pure, deterministic) → plan object `{itinerary, budgetLines,
total}` → rendered via React state; export via `planToMarkdown()` shared by
the download/copy actions.

### Environment variables

App runs with **zero env vars required** — all optional integrations degrade
gracefully. See `.env.example`:

```
VITE_SUPABASE_URL=      # required only for uploads/hidden-gems submission
VITE_SUPABASE_ANON_KEY=
VITE_GOOGLE_MAPS_KEY=   # optional
VITE_YOUTUBE_KEY=       # optional
VITE_WEATHER_KEY=       # optional
VITE_GEMINI_API_KEY=    # optional - AI chat
VITE_AI_API_URL=        # optional - local AI backend, default localhost:8000
```

Copy `.env.example` to `.env.local` and fill what you need. Never commit
`.env.local`.

---

## Getting started

```bash
# Node 18+ required (tested on Node 24)
npm install --legacy-peer-deps   # legacy flag needed: react-query v3 predates React 19 peer ranges
npm run dev                      # http://localhost:5173
```

### Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Vite dev server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Serve the production build |
| `npm run lint` | ESLint (pre-existing errors in third-party-era files; see limitations) |

## Testing

- `npm run build` — production build verified (see CHANGELOG).
- Manual browser QA at mobile (312px) and desktop widths: hero, planner flow
  (search → select → generate → validate → budget → export), nav links.
- No unit-test framework is configured in the project; the planner logic is
  written as pure functions specifically so it *can* be unit-tested easily.

## Deployment (Vercel)

1. Push this repo to your own GitHub account (e.g. `bharatverse-personal`).
2. In Vercel, "Add New Project" → import that repo.
3. Framework preset **Vite**; build command `npm run build`; output `dist`.
4. Add any env vars you need from `.env.example` in Project Settings.
5. Deploy. A SPA fallback (`vercel.json` rewrites) is not currently required
   because routing is state-based.

---

## Known limitations

- **React Query** is pinned at v3 (`react-query`, superseded by TanStack
  Query v4/v5); kept as-is to avoid upgrade risk.
- ESLint reports ~57 pre-existing errors in original files
  (`UploadForm.jsx`, `helpers.js`, `vite.config.js`, etc.). I fixed every
  issue in files I touched but left the original code untouched.
- `vite.config.js` uses a bare `__dirname` (works under Vite's CJS
  interop at runtime, flagged by ESLint).
- AI chat, maps and uploads require their optional API keys; UI degrades
  otherwise.
- Bundle is ~870 kB (single chunk warning) — a candidate for code-splitting.
- The trip budget uses fixed editable assumptions, not live ASI tariffs,
  hotels, or route distances.

## License / attribution

The original BharatVerse source by Team Netaji Ninjas has no OSS licence;
it was published publicly on GitHub for the SIH competition. Their
attribution and SIH links are preserved above and in the README history.
This fork adds clearly-marked improvements for portfolio purposes only.
