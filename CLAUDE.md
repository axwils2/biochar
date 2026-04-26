# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**Keep this file up to date.** When making architectural changes, adding new shared files, changing localization patterns, or otherwise altering how the project works, update the relevant sections here before closing out the work.

## Project Overview

Biochar Project Feasibility Calculator for Latin American Coffee & Cacao Supply Chains. A Climatebase Fellowship Cohort 8 Capstone Project. It is a static, client-side web application (no build step, no framework, no bundler) that runs entirely in the browser.

## Architecture

- **No build system.** Open any `.html` file directly in a browser or serve with a static file server.
- **`engine.js`** — Shared persistence layer exposing `window.BiocharEngine` with `loadProjectData()`, `saveProjectData(data)`, and `clearProjectData()`. All data is stored in `localStorage` under the key `"biocharProjectData"` as a single JSON blob keyed by tool (e.g., `tool1`, `tool2`, ...).
- **`translations.js`** — `window.BiocharTranslations`: all UI strings for all languages, namespaced by page (e.g., `tool1`, `tool2`, `common`). This is the only place translatable strings live.
- **`i18n.js`** — `window.BiocharI18n`: runtime i18n engine. Reads language from `localStorage` key `'biocharLang'`, swaps DOM on `DOMContentLoaded`, and exposes `t(key, vars)` for JS-assigned strings.
- **8 HTML files** (`index.html`, `tool1.html` through `tool7.html`) — each is a self-contained page with inline `<script>` and `<style>`. All three languages are served from the same file via the i18n runtime. There are no `_es` or `_pt` file variants.
- **Tool pipeline** — 7 sequential tools. Tools read upstream data from `BiocharEngine.loadProjectData()` and merge their own key on save.

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
- **Inline everything:** CSS and JS are embedded in each HTML file. There is no shared stylesheet or script bundle (except `engine.js`, `translations.js`, and `i18n.js`).
- **Tailwind via CDN:** `<script src="https://cdn.tailwindcss.com">` — used alongside custom `@apply` rules in `<style>` blocks.
- **Tooltips:** Custom CSS tooltip system (`.tooltip-container` / `.tooltip-text`) used across all tools.
- **All monetary values are in USD.**

## Localization

The project uses a runtime i18n system. All three languages (English, Spanish, Portuguese) are served from the same HTML file — there are no `_es.html` or `_pt.html` variants.

**How it works:**
- Language is stored in `localStorage` under `'biocharLang'`. Default is `'en'`.
- Each page loads `translations.js` and `i18n.js` in `<head>` after `engine.js`.
- A `<select id="lang-select">` in each page calls `BiocharI18n.setLanguage(value)`, which saves to localStorage and reloads the page.

**HTML annotation attributes:**

| Attribute | Sets | Use for |
|---|---|---|
| `data-i18n="ns.key"` | `element.textContent` | Most visible text |
| `data-i18n-placeholder="ns.key"` | `element.placeholder` | Input placeholders |
| `data-i18n-html="ns.key"` | `element.innerHTML` | Tooltip spans with HTML |

**JS dynamic strings** use `BiocharI18n.t(key, vars)` directly:
```js
// Static string
el.textContent = BiocharI18n.t('tool1.supply_desc_default');

// With interpolation ({n} placeholder in translation string)
BiocharI18n.t('tool7.npv_label', { n: projectLife })
```

**Translation namespaces** in `translations.js`:
- `common` — shared strings used across pages (alert_unsaved, confirm_reset, header text, ai_link)
- `index`, `tool1` through `tool7` — page-specific strings

**When modifying UI text:**
1. Update the string in all three language blocks (`en`, `es`, `pt`) in `translations.js`.
2. If adding a new element, annotate it with the appropriate `data-i18n*` attribute and add the key to all three language blocks.
3. Do not hardcode visible strings directly in HTML or JS — use the translation system.

## Development

No install, no build. Serve files locally:
```
python3 -m http.server 8000
# or
npx serve .
```

Then open `http://localhost:8000/index.html`.

To verify translations: open a page, use the language select to switch to ES and PT, and confirm all visible text swaps — including JS-assigned strings (dynamic labels, alert/confirm dialogs, status messages).
