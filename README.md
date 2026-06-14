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

## How Deployment Works (Plain English)

This project does **not** have a traditional CI/CD pipeline with tests, build steps, or staging environments. Because it's a static site (just HTML/CSS/JS files served as-is), the "pipeline" is very simple:

```
You make a change → git push to GitHub `main` → Netlify auto-deploys → live in ~30 seconds
```

### The pieces

1. **GitHub repository** — `biochar-feasibility/calculator` on GitHub. The `main` branch is the source of truth. Whatever is on `main` is what's live.
2. **Netlify** — connected directly to the GitHub repo. Every time a commit lands on `main`, Netlify detects it, copies the files, and serves them from its CDN. There is no compile step (see `netlify.toml`: `command = ""`).
3. **The live site** — `https://biochar-calculator.netlify.app`. Netlify also handles HTTPS, the CDN, and the security headers configured in `netlify.toml`.

### What "deployment" looks like in practice

```bash
# 1. Make a change (or have Claude make one)
# 2. Commit it
git add .
git commit -m "describe what changed"

# 3. Push to GitHub
git push

# 4. Wait ~30 seconds. The change is live.
```

You can watch deploys happen in real time at the Netlify dashboard (Deploys tab). If something breaks, Netlify keeps every previous deploy and lets you click "Publish deploy" on an older one to instantly roll back.

### What there isn't

- **No automated tests** — there are no unit tests or end-to-end tests that run on push. Verification is manual: open the site, click through the tools, confirm numbers look right.
- **No staging environment** — pushing to `main` deploys straight to production. For risky changes, work on a branch and open a pull request; Netlify will build a **deploy preview** (a temporary URL just for that PR) so you can test before merging.
- **No GitHub Actions or other CI** — Netlify is the only automation.

### Environment & secrets

- The Supabase URL and public "anon" key are hardcoded in `auth.js`. This is safe — they're meant to be public; row-level security in Supabase controls what users can actually read/write.
- The one Supabase edge function (`supabase/functions/update-currency-rates`) is deployed separately from the main site via the Supabase dashboard or CLI. Day-to-day site changes do not touch it.
- There are no `.env` files or build-time secrets to manage.

---

## Third-Party Integrations

| Service | What it does | Where to manage it |
|---------|--------------|---------------------|
| **GitHub** | Hosts the source code; `main` branch triggers deploys | github.com/biochar-feasibility/calculator |
| **Netlify** | Hosts the live site, handles HTTPS and the CDN, auto-deploys from GitHub | app.netlify.com |
| **Supabase** | User accounts (sign-in) and optional cloud project storage. Also runs a scheduled function that updates currency exchange rates | app.supabase.com (project: `huxgtaudbdghuowamfxk`) |
| **Frankfurter API** | Free public currency exchange rate API, called directly from the browser. No account needed | frankfurter.dev |
| **Google Fonts** | Loads the Inter font, called directly from the browser | No account |
| **Tailwind CDN** | Loads the Tailwind CSS framework, called directly from the browser | No account |

If any of these go down, here's what breaks:
- **GitHub down** → you can't push new changes, but the live site keeps working.
- **Netlify down** → the live site is unreachable. Everything else still works locally.
- **Supabase down** → sign-in and cloud sync break, but the calculator still works (it uses browser `localStorage` as the default).
- **Frankfurter down** → currency conversion falls back to a hardcoded LatAm rate table (see `currency.js`).

---

## Making Changes with Claude Code

This project was built with [Claude Code](https://www.claude.com/product/claude-code), Anthropic's CLI coding assistant. The codebase is structured to be easy for an AI assistant to navigate and modify safely. Some patterns worth knowing:

### Start every session by reading `CLAUDE.md`

The file `CLAUDE.md` in the project root is Claude's "manual" for this repo. It explains the architecture, the data flow between tools, the design system, and the localization rules. Claude reads it automatically at the start of every session. **If you change how something fundamental works, update `CLAUDE.md` too** — otherwise future AI sessions will miss the new behavior.

### Recommended workflow

1. **Open a terminal in this folder and run `claude`** (after installing Claude Code).
2. **Describe what you want in plain English.** Be specific about which tool/page is involved if you know. For example:
   > "On Tool 4, the bulk biochar price field should also accept negative numbers to model give-away pricing."
3. **Ask Claude to plan first** for non-trivial changes:
   > "Plan this change before making any edits."
   Claude will explore the code and explain its approach before touching anything.
4. **Review the diff** Claude proposes. If something looks wrong, push back — Claude will revise.
5. **Test manually in the browser.** Always run `python3 -m http.server 8000` and click through the affected tool before committing.
6. **Ask Claude to commit and push.** Example:
   > "Commit this and push to main."

### Things to be careful about

- **Don't let Claude break the data flow between tools.** Tools 2–7 each read from earlier tools' saved data. Changing a field name in Tool 2 can silently break Tool 6. If in doubt, ask Claude to "trace where this field is used across all tools."
- **Always test all three languages.** Click the EN/ES/PT selector and confirm visible text swaps. New visible strings must be added to `translations.js` in all three languages.
- **Currency is tricky.** All monetary values are stored internally as USD. Inputs convert in on save; outputs convert out on display. If you're adding a money field, copy the pattern from a neighboring field rather than inventing your own — and tell Claude to do the same.
- **Don't commit secrets.** The Supabase keys in `auth.js` are intentionally public (anon key). Never paste a service-role key, API token, or password into a file.

### Rolling back a bad change

If a deploy breaks the live site:

1. **Quick fix:** Go to Netlify → Deploys → find the last working deploy → click "Publish deploy". The site is restored instantly.
2. **Permanent fix:** Open Claude and say:
   > "The last commit on main broke X. Revert it and push."
   Claude will run `git revert`, push the revert commit, and Netlify will redeploy.

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
