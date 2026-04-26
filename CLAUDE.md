# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Biochar Project Feasibility Calculator for Latin American Coffee & Cacao Supply Chains. A Climatebase Fellowship Cohort 8 Capstone Project. It is a static, client-side web application (no build step, no framework, no bundler) that runs entirely in the browser.

## Architecture

- **No build system.** Open any `.html` file directly in a browser or serve with a static file server.
- **`engine.js`** — Shared persistence layer exposing `window.BiocharEngine` with `loadProjectData()`, `saveProjectData(data)`, and `clearProjectData()`. All data is stored in `localStorage` under the key `"biocharProjectData"` as a single JSON blob keyed by tool (e.g., `tool1`, `tool2`, ...).
- **7 sequential tools** (`tool1.html` through `tool7.html`) — each is a self-contained HTML page with inline `<script>` and `<style>`. Tools read upstream data from `BiocharEngine.loadProjectData()` and merge their own key on save.
- **`index.html`** — Landing page with links to all tools and a "resume project" prompt if `localStorage` has data.
- **3 language variants** — Each page has `_es.html` (Spanish) and `_pt.html` (Portuguese) counterparts. These are full copies, not template-generated. Changes to an English page must be manually replicated to both locale variants.

## Tool Pipeline (data flow)

1. **Tool 1** — Project info & feedstock scale (`tool1` key)
2. **Tool 2** — Production calculator: biochar yield, carbon credits, kiln selection (`tool2` key). Reads `tool1.feedstockTonnes`, `tool1.projectType`, `tool1.numHubs`, `tool1.supplyModel`, `tool1.seasonalityStrategy`.
3. **Tool 3** — Logistics planner: transport routes and costs (`tool3` key)
4. **Tool 4** — Revenue streams: pricing for biochar, credits, wood vinegar (`tool4` key)
5. **Tool 5** — Site, ops & finance: CAPEX, OPEX, lending (`tool5` key)
6. **Tool 6** — Results dashboard: reads all tool keys to compute financial metrics
7. **Tool 7** — Scenario planner: sensitivity sliders for stress-testing

## Key Patterns

- **Save/unsaved guard:** Each tool tracks `hasUnsavedChanges`. Navigation is blocked until the user clicks Save. The `beforeunload` event warns on accidental close.
- **Inline everything:** CSS and JS are embedded in each HTML file. There is no shared stylesheet or script bundle (except `engine.js`).
- **Tailwind via CDN:** `<script src="https://cdn.tailwindcss.com">` — used alongside custom `@apply` rules in `<style>` blocks.
- **Tooltips:** Custom CSS tooltip system (`.tooltip-container` / `.tooltip-text`) used across all tools.
- **All monetary values are in USD.**

## Localization

When modifying any tool, the same change must be applied to all three language files:
- `toolN.html` (English)
- `toolN_es.html` (Spanish)
- `toolN_pt.html` (Portuguese)

The locale files are standalone copies — there is no i18n framework. Translate user-facing strings; keep JS logic identical.

## Development

No install, no build. Serve files locally:
```
python3 -m http.server 8000
# or
npx serve .
```

Then open `http://localhost:8000/index.html`.
