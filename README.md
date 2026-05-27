# Biochar Project Feasibility Calculator

A financial feasibility calculator for biochar projects in Latin American coffee and cacao supply chains. Built as a Climatebase Fellowship Cohort 8 Capstone Project.

The app guides producers through a 7-step pipeline — from feedstock scale to a full financial dashboard — with support for English, Spanish, and Portuguese.

---

## Running Locally

No install, no build step. Serve the files with any static file server:

```bash
# Python (built into macOS/Linux)
python3 -m http.server 8000

# Node.js
npx serve .
```

Then open [http://localhost:8000](http://localhost:8000).

> **Why a server?** Some browsers block ES module scripts loaded from `file://`. A local server avoids that restriction.

---

## The 7-Step Tool Pipeline

Each tool saves its output to `localStorage` and the next tool reads it. Complete them in order.

| Step | Tool | What it does |
|------|------|--------------|
| 1 | Project Info | Feedstock type, volume, number of hubs, supply model |
| 2 | Production | Biochar yield, carbon credits, kiln selection and CAPEX |
| 3 | Logistics | Transport routes, distances, and annual logistics cost |
| 4 | Revenue Streams | Biochar price, carbon credit price, wood vinegar pricing |
| 5 | Site, Ops & Finance | CAPEX breakdown, OPEX, staffing, lending, tax |
| 6 | Results Dashboard | NPV, profit, payback period, full P&L summary |
| 7 | Scenario Planner | Sensitivity sliders to stress-test the base case |

---

## Features

- **No backend required** — all calculations run in the browser; data persists in `localStorage`
- **Multi-currency** — every monetary input and output has a currency selector; supported currencies: USD, MXN, COP, BRL, PEN, GTQ, HNL, NIO, CRC. Exchange rates are fetched live from [Frankfurter](https://www.frankfurter.dev/) and cached for 24 hours
- **Three languages** — English, Spanish, and Portuguese served from a single HTML file; switch with the language selector in the header
- **Optional cloud sync** — sign in with a Supabase account to save and load projects across devices
- **AI assistant** — a companion ChatGPT assistant is linked from the homepage for guidance on interpreting results

---

## Project Structure

```
index.html          Homepage and project manager
login.html          Authentication page
tool1.html–tool7.html  The 7 calculation steps
admin.html          Admin panel (project data management)
projects.html       Saved projects list

engine.js           Shared persistence layer (localStorage + optional Supabase sync)
currency.js         Exchange rate fetching, conversion helpers, and DOM wrappers
translations.js     All UI strings for EN / ES / PT
i18n.js             Runtime i18n engine
auth.js             Supabase authentication
styles.css          Shared component styles and design tokens
```

---

## Tech Stack

- Vanilla HTML, CSS, and JavaScript — no framework, no bundler
- [Tailwind CSS v4](https://tailwindcss.com/) via browser CDN (utility classes only)
- [Supabase](https://supabase.com/) for optional cloud authentication and project storage
- [Frankfurter API](https://www.frankfurter.dev/) for live currency exchange rates
- Deployed on [Netlify](https://www.netlify.com/)

---

## Localization

All three languages are served from the same HTML file. To add or edit strings:

1. Open `translations.js`
2. Find the relevant namespace (`common`, `tool1`–`tool7`, `index`)
3. Update the string in all three language blocks (`en`, `es`, `pt`)
4. Annotate new HTML elements with `data-i18n="namespace.key"`

Test by switching languages with the selector in the top-right corner of any page.

---

## Data & Privacy

All project data is stored locally in `localStorage` under the key `biocharProjectData`. Nothing is sent to a server unless the user explicitly signs in. Exchange rates are cached in `localStorage` under `biocharExchangeRates` and refreshed every 24 hours.

To clear all data: use the Reset button on any tool page, or run `localStorage.clear()` in the browser console.

---

## Disclaimer

This tool produces estimates based on user-supplied inputs. Results are not financial advice. Verify all costs, prices, and assumptions with local market data before making investment decisions.
