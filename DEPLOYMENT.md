# LCGC Web — Deployment & Wiring Reference

> **What this is:** the single source of truth for everything deployed for LC General
> Contracting's customer-facing site — what was built, where it lives, and exactly how
> the lead capture is wired. Written so that future-you (or future-Thomas) can pick this
> up cold months from now.
>
> _Last verified: 2026-06-06 · commit `672aa53` on `main`._

---

## 1. At a glance

| | |
|---|---|
| **What** | Public lead funnel for LCGC: a marketing homepage + a visitor budget estimator |
| **Stack** | Self-contained static HTML (inline CSS/JS). **No build step, no framework.** |
| **Hosting** | GitHub Pages, auto-deploys on push to `main` (~30–90s) |
| **Repo** | `github.com/eugeniousC/lcgc-web` (public) |
| **Live homepage** | https://eugeniousc.github.io/lcgc-web/ |
| **Live estimator** | https://eugeniousc.github.io/lcgc-web/LCGC_Budget_Estimator.html |
| **Lead backend** | Standalone Google Apps Script → "LCGC Leads" Google Sheet (owned by `eugene@atscale-advisors.com`) |
| **Brand** | LCGC only. **No "Fields"** anywhere (Jeremy Fields is on Len's old site; deliberately excluded). |

---

## 2. Two-repo architecture (important)

There are **two separate repos**, kept apart on purpose:

```
lcgc-web  (THIS repo) ......... public lead funnel — homepage + estimator
lcgc-prototype ............... Len's REAL production planner (the tool he runs jobs on)
```

| | `lcgc-web` (funnel) | `lcgc-prototype` (Core) |
|---|---|---|
| Audience | Website visitors / prospects | Len, internal use |
| Lives on | This Linux box (`~/Projects/LCGCweb`) | The **Mac** (`~/Projects/LCGC`) |
| Live URL | `eugeniousc.github.io/lcgc-web/` | `eugeniousc.github.io/lcgc-prototype/LC_Construction_Budget_Planner.html` |
| Backend | "LCGC **Leads**" sheet (low-risk, public) | Len's planner sheet + customer records (private) |

**Why separated:** public lead capture and private customer records are different risk
profiles. If the public endpoint ever gets spammed or broken, it must **never** be able
to touch Len's live planner data. Website work in this repo physically cannot break the
Core. **The Core planner is never edited by website work.**

---

## 3. File inventory (this repo)

| File | Role |
|------|------|
| `index.html` | Marketing homepage (see §4) |
| `LCGC_Budget_Estimator.html` | Public budget estimator (see §5) |
| `backend/LeadsScript.gs` | The Apps Script that powers lead capture (see §7). **Source-of-truth copy — the live one runs in Google.** |
| `assets/len/` | 8 of Len's **real** project photos (pulled from his GoDaddy site) |
| `README.md` | Short repo intro |
| `DEPLOYMENT.md` | This file |

---

## 4. The homepage — `index.html`

A premium, lead-generation homepage. **Wedge = total budget transparency** ("see every
dollar of your build — down to our profit").

**Sections, top to bottom:**
1. **Hero** — transparency headline over a real LCGC home photo; CTAs → budget + estimate
2. **Trust bar** — licensed/insured, 40+ yrs, free estimates, etc. (SVG check icons)
3. **Why LCGC** — 3 differentiator pillars, transparency first (dark feature card)
4. **Services** — 6 cards (New Homes, Kitchens/Baths, Remodeling, Additions/Sunrooms, Decks, Generators)
5. **Your Home Budget** — lead magnet + **animated budget preview** (counts up, bars fill on scroll). Links to the estimator.
6. **Numbers band** — count-up stats (40+ yrs · 100s homes · 5 counties · 100% visible)
7. **Our Work** — 7-photo gallery (all real LCGC projects)
8. **Reviews** — 6 cards (⚠ **placeholder text** — awaiting Len's 6 real quotes)
9. **About** — Len/LCGC story + real exterior photo
10. **Contact** — the **free in-home estimate form** (see §6 for wiring) + phone/email
11. **Footer**

**Brand system** (CSS vars at top of file): navy `#1a2438` · emerald `#047857` ·
amber `#D97706` · warm white `#F8F7F4`. Fonts: Playfair Display (headlines), DM Sans
(body), DM Mono (numbers).

**Motion:** scroll-reveal + count-ups via `IntersectionObserver`; all guarded by
`prefers-reduced-motion` (no motion for users who ask for none).

**Photos:** real photos in `assets/len/` are used everywhere **except** the Deck and
Generator service cards, which are still Unsplash stock (Len hasn't sent those shots).
Search the file for `SWAP:` to find every remaining placeholder.

---

## 5. The estimator — `LCGC_Budget_Estimator.html`

A stripped, public version of Len's production planner. Visitor enters a total budget
(or sqft × $/sqft), picks Barndominium vs Conventional, and instantly sees the home it
builds — full phase breakdown, Customer View, and a Bank Draw schedule. **No backend
math leaves the page** (all client-side). It has **no** GSheet customer records, no
actuals/progress/paid columns — those are Core-only.

Its job in the funnel: turn a curious visitor into a booked meeting via the lead form
(see §6). The estimator's logo links back to the homepage (`index.html`).

---

## 6. Lead capture — how it's wired (the key part)

Both the **homepage estimate form** and the **estimator's email-capture form** feed the
**same** Google Sheet through the **same** Apps Script endpoint, tagged by a `source`
field so they stay distinguishable.

```
  ┌─────────────────────────┐      ┌──────────────────────────┐
  │ Homepage estimate form  │      │ Estimator email-capture  │
  │ (index.html, #contact)  │      │ (LCGC_Budget_Estimator)  │
  │ source: "homepage"      │      │ source: "estimator"      │
  └───────────┬─────────────┘      └────────────┬─────────────┘
              │  POST (text/plain, mode:no-cors, 7s timeout)    │
              └───────────────────┬─────────────────────────────┘
                                  ▼
                 Google Apps Script  /exec  (doPost)
                 backend/LeadsScript.gs (runs in Google)
                                  │
                 ┌────────────────┴───────────────┐
                 ▼                                 ▼
        Append row to                     Email notification
        "LCGC Leads" sheet                to Len (+ CC Eugene)
                                          replyTo = visitor's email
                                  │
        (on network failure / timeout the browser falls back to a
         mailto: draft so a lead is never lost)
```

**The endpoint** (same for both forms):
```
https://script.google.com/macros/s/AKfycbyg3-cuFtMK-CRwJbXeJ-cm5q3gxZ2D2N6JTP5eestm-Fnq-hdWw3TcMh2XbfSJF2smXw/exec
```
Defined in `index.html` (`LEADS_ENDPOINT`, in the homepage `<script>`) **and**
`LCGC_Budget_Estimator.html` (line ~2084). If the deployment URL ever changes, update
**both** files.

**Why the weird fetch options:**
- `Content-Type: text/plain` → dodges the CORS **preflight** that Apps Script can't answer.
- `mode: 'no-cors'` → lets the row land without needing a readable response back.
- 7-second `AbortController` timeout → on a real network failure, fall back to `mailto:`.

**Spam / safety built in:**
- **Honeypot** — a hidden `company` field. Bots fill it; we silently show "success" and write nothing.
- **Email validation** — both client and server check for a plausible email.
- **Dedupe** — server ignores an identical email re-submitted within 2 minutes (double-click / retry).
- **Row before email** — the row is written *before* the notification, so a mail quota error never loses the lead.

**What success looks like to the visitor:** the form is replaced with
"✓ Thanks! … you will hear from us shortly." (If it had to fall back to `mailto:`, their
mail client opens with everything pre-filled.)

---

## 7. The backend — `backend/LeadsScript.gs` + "LCGC Leads" sheet

The Apps Script is **pasted into the Google Sheet's Apps Script editor** and deployed as
a Web App. The copy in this repo is the source of truth — **editing it here does nothing
until you paste + redeploy in Google** (see §7.3).

### 7.1 The sheet
- Name: **LCGC Leads** · Owner: `eugene@atscale-advisors.com`
- One tab, `Leads`, with a frozen header row.
- **16 columns**, one row per lead. Estimator leads fill the build columns; homepage
  leads fill phone/project/budget/message. Each source leaves the other's columns blank.

```
timestamp | name | email | build_type | total_budget | oop_pct | oop_dollars |
construction_only | cost_per_sqft | est_sqft | source | user_agent |
phone | project_type | budget_range | message
└──────────────── estimator fills these ───────────────┘  └─ homepage fills these ─┘
```

### 7.2 Key settings (top of the script)
| Var | Value | Note |
|---|---|---|
| `SHEET_NAME` | `Leads` | tab name |
| `NOTIFY_TO` | `LCovington@lcgeneralcontracting.com` | **Len** — the live recipient |
| `NOTIFY_CC` | `eugene@atscale-advisors.com` | ⚠ **TESTING ONLY** — remove before handing the sheet to Len (see §9) |
| `DEDUPE_MIN` | `2` | minutes |

The notification email is **source-aware**: a homepage lead reads as a "New LCGC estimate
request" (name/phone/project/budget/message); an estimator lead reads as a budget lead
(build type/budget/sqft).

### 7.3 How to change the backend (the redeploy ritual)
Editing the `.gs` in the Google editor is **not enough** — you must ship a new version:
1. Open **LCGC Leads** sheet → **Extensions → Apps Script**.
2. Paste the updated `backend/LeadsScript.gs`, **Save**.
3. If you changed columns: run **`setupSheet`** once (function dropdown → Run) — it
   rewrites the header row (safe; never touches data).
4. **Deploy → Manage deployments → edit (✏️) → Version: _New version_ → Deploy.**

If you skip step 4, the live endpoint keeps running the old code. (This is the #1 gotcha.)

### 7.4 Health check
Visit the `/exec` URL in a browser (or `curl -sL`). Healthy =
`{"ok":true,"service":"lcgc-leads"}`.

---

## 8. Deploying website changes

```bash
cd ~/Projects/LCGCweb
# edit index.html / LCGC_Budget_Estimator.html
git add -A && git commit -m "…"
git push origin main          # GitHub Pages rebuilds in ~30–90s
```
There's no build step — what's in the repo is what's served. Internal links between the
two pages are **relative**, so the whole site is portable to the real domain
(`lcgeneralcontracting.com`) with zero code changes — just point DNS / Pages custom domain.

---

## 9. Verifying changes

No local Chrome on this box. Two options, both real-browser:
- **Screenshots:** headless Chrome on the Mac over `ssh mac`, e.g.
  `--headless=new --window-size=1440,3600 --screenshot=/tmp/x.png "<url>"`, then `scp` back.
  (Capture at **≥500px wide** for mobile — headless has a ~500px min layout viewport.)
- **Real interaction / form tests:** `interceptor open <url>` then `interceptor eval --main '…'`.
  This drives the Mac's actual logged-in Chrome. Close test tabs by **exact tab id**
  (`interceptor tab close <id>`), never by URL match.

The homepage form was verified end-to-end on 2026-06-06: real submit → row landed in the
sheet with all homepage columns populated → `source=homepage`.

---

## 10. Open items / things still to do

| Item | Where | Status |
|---|---|---|
| Replace 6 **review placeholders** with Len's real quotes | `index.html` → Reviews section (`PLACEHOLDER`) | ⏳ awaiting Len |
| Replace **Deck + Generator** stock photos with Len's | `index.html` → Services (`SWAP:`) | ⏳ awaiting Len |
| **Remove `NOTIFY_CC`** (Eugene) before handing sheet to Len | `backend/LeadsScript.gs` line ~28, then redeploy (§7.3) | ⏳ after testing |
| Point real domain `lcgeneralcontracting.com` at this site | GitHub Pages custom domain | 🔜 later |
| Delete the test rows from the Leads sheet | "LCGC Leads" sheet | housekeeping |

---

## 11. Quick-reference facts

| | |
|---|---|
| Len's phone | 770-294-1635 |
| Len's email | LCovington@lcgeneralcontracting.com |
| Leads endpoint | `…/macros/s/AKfycbyg…XbfSJF2smXw/exec` (full URL in §6) |
| Leads sheet owner | eugene@atscale-advisors.com |
| Homepage form fields | first/last name, phone, email, project type, budget range, message |
| Estimator form fields | name, email (+ the live estimate numbers) |
| Counties served | Coweta, Carroll, Haralson, Paulding (+ surrounding) |
