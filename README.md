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

## NOT in this repo (by design)
The **production Construction Budget Planner** that Len uses for real jobs — plus its
Google Sheets / Apps Script backend and customer records — lives in a **separate repo
(`lcgc-prototype`)** and is **not** touched by website work. Public funnel and the
internal tool are different products with different risk profiles; keeping them apart
means changes here can never break Len's live planner.

## Deploy
Push to `main` → GitHub Pages auto-builds (~30–90s).
- Live: https://eugeniousc.github.io/lcgc-web/

## Lead capture
Currently `mailto:` (zero-backend). A standalone Apps Script + "LCGC Leads" Google
Sheet (separate from the planner's backend) is planned to capture every lead
server-side and notify Len instantly, with `mailto:` kept as the fallback.
