# RESUME HERE — LCGC Web

**Last updated:** 2026-06-08 · Parked by **Thomas (Linux box)**
**State in one line:** Site is live and feature-complete *pending Len's team review*; Meta Pixel live + verified; marketing foundation decided (Google-first) with the GBP kit drafted. Holding for Len's feedback before the domain migration.

---

## Where we are
- **Live site:** https://eugeniousc.github.io/lcgc-web/
- **Repo:** `eugeniousC/lcgc-web` (this Linux box: `/home/ecoleman/Projects/LCGCweb`)
- **Branch:** `main` · **Latest commit:** `40bcd6e` — Add Meta Pixel + Lead event on form success
- **Real domain (not yet migrated):** `lcgeneralcontracting.com` (currently GoDaddy)

---

## What's done
- [x] Premium homepage live (transparency-led hero, real Len photos, animated budget showpiece, motion + SVG icons)
- [x] Lead capture wired end-to-end — **both** homepage `#contact` form and the estimator POST to the Apps Script → "LCGC Leads" Google Sheet + email to Len, tagged by `source`. Verified end-to-end via Interceptor + Drive.
- [x] `DEPLOYMENT.md` written — full deploy + lead-wiring reference.
- [x] **Meta Pixel `1004453845333566` live + verified** firing `PageView` (site-wide) and `Lead` (genuine form-success only; honeypot silent) in real Chrome on both pages.
- [x] Meta ad account confirmed (**LCGC-Ads**), **billing added**, and the **pixel↔ad-account link confirmed** (dataset Settings → Sharing → Ad accounts).
- [x] Marketing strategy decided + **GBP optimization kit drafted** → `marketing/GBP_KIT.md` (⚠ LOCAL ONLY — gitignored, see below).

---

## What's next (in order)
1. **[Eugene/Len] Len's team reviews the site → collect change requests.** Owner: Eugene. *This gates the domain migration.* (Eugene: "i am certain they will have changes.")
2. **[Thomas] Implement Len's requested changes** once they arrive. ~varies.
3. **[Eugene] GBP work — runs in parallel, no dependency on the site review.** Verify the GBP at business.google.com, start the Google Screened background check (1–2 wk, needs Len's license # + insurance), run the review-request texts. Use `marketing/GBP_KIT.md`. ~1–2 hrs setup + ongoing.
4. **[Thomas] Draft the LSA (Local Services Ads) setup sheet** — the "Walk" phase. When Eugene asks / once GBP is verified. ~30 min.
5. **[Eugene+Thomas] Domain migration** — *gated on site approval (step 1).* GoDaddy → Cloudflare DNS → GH Pages, then E2E QA. Thomas steps Eugene through. **Landmine: copy MX/SPF/DKIM/TXT first or Len's email dies.** From Len, only the GoDaddy login (use Delegate Access) is needed. See `memory/lcgc-domain-migration-plan.md`.
6. **[Eugene] Pre-handoff cleanup** before giving the Leads sheet to Len: remove `NOTIFY_CC` (eugene@atscale-advisors.com) from `backend/LeadsScript.gs` + redeploy the Apps Script; delete the test rows from the sheet. NOT now — keep the CC during testing.

---

## Active decisions / IP state (do NOT re-litigate or drift)
- **Brand = LCGC only. NO "Fields" / Jeremy Fields anywhere.** Deliberately excluded.
- **The production Core planner is NEVER touched by website work** — it lives in a separate repo (`lcgc-prototype`, on the Mac). Any visitor-facing planner is totally separate.
- **Lead backend is separate** from the planner's customer-records backend.
- **Marketing sequence: Google-FIRST** — GBP + reviews → Local Services Ads → Search Ads. **Facebook = remodel demand-gen + retargeting amplifier, NOT the primary lead engine** (wrong channel for cold $409K custom-home leads).
- **Differentiator = total budget transparency** (the whole site wedge).
- **CAPI = parked.** Browser pixel only for now; CAPI is the fast-follow upgrade off the Apps Script when we want it.
- **Unit economics:** remodel $44K @ 20% = $8,800 GP; build $409K @ 15% = $61,350 GP. CAC is a non-constraint; Len's crew capacity is the real ceiling.

---

## File locations
| Artifact | Path | Notes |
|---|---|---|
| Homepage | `index.html` | pixel + `#contact` lead form |
| Estimator | `LCGC_Budget_Estimator.html` | pixel + lead form |
| Lead backend | `backend/LeadsScript.gs` | Apps Script; ⚠ has NOTIFY_CC to remove pre-handoff |
| Deploy reference | `DEPLOYMENT.md` | full deploy + wiring picture |
| **GBP kit** | `marketing/GBP_KIT.md` | ⚠ **gitignored — LOCAL to this Linux box only** |
| Len's photos | `assets/len/*.jpg/.jpeg` | real project shots (shipped) |
| Memory (Meta IDs) | `~/.claude/projects/-home-ecoleman-Projects-LCGCweb/memory/lcgc-meta-ad-ids.md` | local only |
| Memory (migration) | `…/memory/lcgc-domain-migration-plan.md` | local only |

---

## If you (next-Thomas) pick this up
- **Continue on this Linux box** (default — everything's here), **or** SSH to Mac-Thomas over Tailscale, **or** fresh `git clone`.
- ⚠ **Heads-up for a clone elsewhere:** `marketing/GBP_KIT.md` and the `memory/` files are **gitignored / local to this Linux box** — a fresh clone on another machine will NOT have the GBP kit or the Meta-ID / migration memories. To fully resume elsewhere, work on this machine or copy those files over.
- **Canonical next step:** nothing to build until Len's site feedback lands (step 1). In parallel, Eugene runs the GBP setup from `marketing/GBP_KIT.md`. Don't start the domain migration until the site is approved.
