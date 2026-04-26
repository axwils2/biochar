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

## Design System

All shared visual styles live in **`styles.css`** — the single source of truth for component classes. Every HTML page loads it via `<link rel="stylesheet" href="styles.css">`. Never define button, input, card, or tooltip styles inside a page's own `<style>` block; page-level styles are reserved for truly page-specific components (e.g., accordion panels, kiln selection cards, scenario sliders).

**CSS stack:** Tailwind v4 Browser CDN (`https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4`) for utility classes. No `@apply` — Tailwind v4 browser mode does not support it. Plain CSS component classes in `styles.css`. Inter font from Google Fonts.

**Design tokens** (CSS custom properties in `:root`):
- `--color-primary` (`#0d9488`), `--color-primary-dark`, `--color-primary-deepest`, `--color-primary-light`, `--color-primary-border`, `--color-primary-border-light`
- `--color-warning-bg/border/text/strong`, `--color-danger-bg/border/text`
- `--color-neutral-50` through `--color-neutral-900`
- `--shadow-card`, `--shadow-card-hover`, `--radius-card`, `--radius-input`, `--radius-btn`, `--radius-pill`

**Shared component classes:** `.app-header`, `.app-logo`, `.app-logo-mark`, `.app-logo-name`, `.app-step-badge`, `.app-step-name`, `.app-step-of`, `.app-lang-select`, `.app-progress-track`, `.app-progress-fill`, `.step-nav`, `.step-pill`, `.step-pill-done`, `.step-pill-active`, `.step-pill-future`, `.dep-alert`, `.dep-alert-icon`, `.dep-alert-text`, `.page-content`, `.section-card`, `.section-card-header`, `.kpi-grid`, `.kpi`, `.kpi-label`, `.kpi-value`, `.kpi-unit`, `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-danger`, `.btn-ghost`, `.btn-sm`, `.input-label`, `.input`, `.input-group`, `.tooltip-wrap`, `.tooltip-icon`, `.tooltip-text`, `.tool-card`, `.tool-card-number`, `.tool-card-title`, `.tool-card-desc`, `.app-footer`, `.footer-disclaimer-grid`, `.footer-card`, `.footer-card-title`, `.footer-card-text`, `.footer-attr`, `.hidden`

**Mobile-first:** All layout is single-column by default; `@media (min-width: 768px)` expands to multi-column. `.app-logo-name` and `.app-step-name` are hidden below 768px.

**Page structure** (tool pages, in order):
1. `<header class="app-header">` — logo, step badge, step name, "· N of 7", lang select
2. `<div class="app-progress-track"><div class="app-progress-fill" style="width: X%"></div></div>` — progress widths: 14 / 29 / 43 / 57 / 71 / 86 / 100%
3. `<nav class="step-nav">` — 7 step pills; active = `.step-pill-active`, others = `<button onclick="navigate(url)" class="step-pill step-pill-done/future">`
4. Dep alert (tools 2, 3, 6, 7): `<div id="depAlert" class="dep-alert" style="display:none;">` — shown via JS when upstream data missing
5. `<main class="page-content">` — page body
6. `</main>`
7. `<footer class="app-footer">` — standard 3-card disclaimer grid + attribution

## Key Patterns

- **Save/unsaved guard:** Each tool tracks `hasUnsavedChanges`. `navigate(url)` calls `confirm(BiocharI18n.t('common.alert_unsaved_confirm'))` — user can choose to proceed or cancel. The `beforeunload` event warns on accidental close.
- **Shared styles in `styles.css`, page-specific styles inline:** Inline `<style>` blocks are for page-specific components only (kiln cards, accordion, scenario sliders, etc.).
- **Tailwind v4 via CDN:** `<script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4">` — no `@apply`, utility classes only.
- **Tooltips:** CSS tooltip system using `.tooltip-wrap` / `.tooltip-icon` / `.tooltip-text` from `styles.css` (old class names `.tooltip-container` / `.tooltip-text` no longer used).
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
- `common` — shared strings used across pages: `alert_unsaved_confirm`, `confirm_reset`, header/footer text, `cohort`, footer disclaimer cards (`footer_no_guarantee_label`, `footer_not_advice_label`, `footer_verify_label`, and their body keys)
- `index`, `tool1` through `tool7` — page-specific strings
- Each tool namespace has a `step_name` key (e.g. `tool1.step_name`) used in the step nav pills
- Tools 2, 3, 6, 7 have `dep_alert_title`, `dep_alert_msg`, `dep_alert_link` for the upstream-data dependency alert

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
