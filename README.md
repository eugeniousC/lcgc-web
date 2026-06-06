# lcgc-web — LC General Contracting (customer-facing site)

The public **lead funnel** for LC General Contracting: a marketing homepage and a
visitor-facing budget estimator. Static, self-contained HTML — no build step, no
framework. Deployed via GitHub Pages.

## What's here
| File | Role |
|------|------|
| `index.html` | Marketing homepage — hero, services, "Your Home Budget" lead magnet, gallery, reviews, lead form. |
| `LCGC_Budget_Estimator.html` | Public budget estimator — enter a budget → see the home it builds → book a meeting. Derived from the production planner but heavily stripped (no backend, no actuals/progress). |

Internal links between the two are **relative**, so the site is portable to a real
domain (`lcgeneralcontracting.com`) with zero code changes.

## The funnel
`index.html` → "Your Home Budget" → `LCGC_Budget_Estimator.html` → enter numbers →
"Email My Estimate & Book a Meeting" (lead capture) → estimator logo links back home.
The homepage **also** has its own in-home-estimate form (`#contact`) that captures leads
directly.

## 📖 Full reference
**See [`DEPLOYMENT.md`](./DEPLOYMENT.md)** for the complete picture — what's deployed,
the two-repo architecture, and exactly how lead capture is wired end-to-end.

## NOT in this repo (by design)
The **production Construction Budget Planner** that Len uses for real jobs — plus its
Google Sheets / Apps Script backend and customer records — lives in a **separate repo
(`lcgc-prototype`)** and is **not** touched by website work. Public funnel and the
internal tool are different products with different risk profiles; keeping them apart
means changes here can never break Len's live planner.

## Deploy
Push to `main` → GitHub Pages auto-builds (~30–90s).
- Live: https://eugeniousc.github.io/lcgc-web/

## Lead capture (LIVE)
Both forms (homepage `#contact` + estimator) POST to a standalone Apps Script that writes
to the **"LCGC Leads"** Google Sheet (separate from the planner backend) and emails Len
instantly, tagged by `source`. `mailto:` is the fallback if the network fails. Backend
script: [`backend/LeadsScript.gs`](./backend/LeadsScript.gs). Full wiring + the redeploy
ritual: **[`DEPLOYMENT.md`](./DEPLOYMENT.md) §6–7**.
