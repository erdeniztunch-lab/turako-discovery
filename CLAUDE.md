# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the App

```bash
npm run dev
# or
node scripts/dev-server.js
```

Opens `http://127.0.0.1:5173/Turako.html` in the browser. Set `PORT` env var to change the port. There is no build step, no bundler, and no test suite.

## Architecture

Turako is a **single-HTML-file React app** that runs entirely in the browser with no backend. There is no module system — all files are loaded as `<script type="text/babel">` tags in `Turako.html`, transpiled in the browser by Babel Standalone. All components and functions live in the global `window` scope; `Object.assign(window, {...})` at the bottom of each file is how they're exposed.

**Script load order matters** (defined in `Turako.html`):
1. `tweaks-panel.jsx` — floating dev panel for UI tweaks
2. `data.jsx` — data model, sample data, and all business logic functions
3. `components.jsx` — shared UI primitives (Icon, Tag, ConfidenceBar, etc.)
4. `shell.jsx` — Sidebar, Topbar, SearchModal, TourOverlay, TOUR_STEPS
5. `screens/landing.jsx` — Landing page and Onboarding flow (pre-app stages)
6. `screens/home.jsx` — Home dashboard
7. `screens/capture.jsx` — Capture (paste-to-problem flow), IntegrationPanel
8. `screens/signals.jsx` — Signal review and problem linking
9. `screens/pipeline.jsx` — Problems, Opportunities, Decisions (core pipeline screens)
10. `screens/learnings.jsx` — Learnings screen
11. `screens/settings.jsx` — Settings screen (depends on IntegrationPanel from capture.jsx)
12. `app.jsx` — root App component, routing, and state

## State Management

All workspace state lives in `app.jsx` as a single `ws` object passed down as props. State is persisted to `localStorage` under the key `turako:state:v1`. The workspace shape:

```js
{
  product: { name, description, segments, focus },
  sources: [...],
  signals: [...],
  problems: [...],
  opportunities: [...],
  decisions: [...],
  learnings: [...],
}
```

App stages: `loading → landing → onboarding → app`. Route is a string (`"home"`, `"capture"`, `"signals"`, `"problems"`, `"opportunities"`, `"decisions"`, `"learnings"`, `"settings"`).

## Key Business Logic (all in `data.jsx`)

- **`extractSignalsFromText(text, sourceId)`** — splits text into sentences, classifies each as `stated` / `observed` / `inferred` and `weak` / `medium` / `strong` using keyword matching (no NLP).
- **`computeConfidence(problem, signals, learnings, decisions)`** — returns 0–100 based on signal count, strength, type diversity, and validated learnings.
- **`buildRecommendation(ws)`** — returns ranked array of next actions: `promote` (opportunity ready for decision), `investigate` (thin evidence), or `review` (stale decision > 21 days).
- **`detectBlindSpots(ws)`** — flags `thin` (single signal), `stated-only` (no observed evidence), and `stale` (decision not reviewed in 21+ days).
- **`buildIntegrationImport(integrationId, existingSources)`** — generates mock source + signals from the integration catalog for HubSpot, Zendesk, and Google Analytics.

## Theming

Themes are driven by HTML attributes on `<html>` and CSS custom properties. `app.jsx` sets these reactively:

- `data-theme`: `"dark"` | `"light"`
- `data-aesthetic`: `"calm"` | `"editorial"` | `"operational"`
- `data-density`: `"tight"` | `"medium"` | `"spacious"`
- `--accent`, `--accent-strong`, `--accent-soft`: oklch color vars controlled by `accentHue` tweak

The floating TweaksPanel (bottom-right in browser) lets you toggle these live during development.

## Data Pipeline

The pipeline flows one-way: `Source → Signal → Problem → Opportunity → Decision → Learning`. Each entity references its parent by ID. Signals have a `problem` field (null if unlinked). Problems have an `opportunities` array. Opportunities have a `decision` field. Decisions have a `learnings` array.

## Mock Integrations

HubSpot, Zendesk, and Google Analytics are frontend-only mocks. Connecting and syncing writes a pre-defined sample source + signals into `ws`. The integration catalog with sample texts lives in `data.jsx` (`INTEGRATION_CATALOG`).
