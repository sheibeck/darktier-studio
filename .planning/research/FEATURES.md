# Feature Research

**Domain:** In-site-hosted, self-contained interactive companion web apps (embedded in an existing Astro + Firebase marketing/CMS site)
**Researched:** 2026-08-18
**Confidence:** MEDIUM — general web/PWA/localStorage and Astro-islands practice is well established (MEDIUM-confidence, cross-checked across multiple independent sources); direct precedent for "solo tabletop studio hosts a catalog of in-site companion tools" is thin (LOW-confidence, inferred from adjacent patterns) — see Gaps.

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist for any hosted companion/utility tool used at a game table. Missing these = the tool feels broken or untrustworthy mid-session.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Own crawlable, shareable URL per app (`/armory/<slug>`) | Players share a link ("use this for Fate of the Fellowship") in Discord/group chat; it must resolve directly, not require navigating from home | LOW | Already the plan — Astro route per app, SSR'd HTML shell so the URL alone works. Depends on existing Astro routing + SEO layout pattern from v1.0. |
| Deep-linkable / bookmarkable | Players bookmark the tool once and return to it session after session without re-finding it via The Armory | LOW | Falls out of "own route" — no extra work if routes are stable, permanent slugs (never renumber/rename after publishing). |
| Per-app OG/meta so shared links preview well | Same "good-looking shared links" goal that drove the whole v1.0 SEO investment applies to app routes too — a bare/generic preview undercuts trust when linked in a group chat | LOW | Depends on existing per-page SEO/OG layout component from v1.0; each app needs a title/description/OG-image entry, same shape as Games/Tools already have. |
| Mobile-first responsive layout, usable one-handed on a phone at the table | Stated usage context: played on phones/tablets at a physical table, often propped or handheld, sometimes low light | MEDIUM | Charlie Mike TOC precedent already does this for one companion app. Burning Banners' ~231 Tailwind utility classes need to be verified for genuinely responsive (not just desktop-designed) layout — flag as a per-app QA item, not automatic. |
| localStorage state persists across reloads/tab close/browser restart | Table sessions get interrupted (someone closes the tab, phone locks, browser crashes) — losing tracked state (HP, tokens, mission progress) mid-game is the single worst failure mode for a tool at the table | LOW | Read-on-mount / write-on-change pattern (`useEffect` or equivalent), namespaced key per app (e.g. `fotf:session`) so apps don't collide in the same origin's storage. Must handle storage-write failures gracefully (private/incognito mode, quota) — don't crash the app, just skip persistence silently or warn once. |
| Reset / "start new session" affordance inside the app | Games end, a new session starts — users need to explicitly clear tracked state without clearing all site data or needing dev tools | LOW | An explicit in-app button, not "clear your browser data." Should be a deliberate confirm-before-wipe action (accidental data loss during a live session is the worst-case UX failure here). |
| Clear way back to the main site (nav/footer) from inside the app | User launched from The Armory and expects to return without using the browser back button (which may not exist as a natural affordance on some mobile browsers/PWA-installed contexts) | LOW | Already decided: each app runs inside the Nocturne page shell (nav/footer) while keeping its own internal look. This is the single biggest UX differentiator vs. a plain external redirect to a separate domain — no context-switch, no "which tab am I in" confusion. |
| Works without a network round-trip after initial load | Game tables often have spotty venue wifi/cellular; a tool that needs to phone home to function mid-session (e.g. hits an API for every state change) is a bad table companion | MEDIUM | Because state is localStorage-only (no Firestore for game state, no auth), once the page/bundle has loaded the app needs zero further network calls to function — this is a natural consequence of the MVP's local-only architecture, not extra work, but should be verified (no accidental fetch() calls left in from copied code). |
| Fast initial load on the route (no heavy unrelated JS) | Table companion apps get opened mid-game, under time pressure — a slow first paint reads as broken | LOW–MEDIUM | Astro islands only ship JS for the hydrated component; each companion app's route should NOT pull in unrelated site JS (admin/Firebase SDK) — keep the island's client bundle scoped to just that app. |
| The app is discoverable from The Armory catalog, matching other tools' presentation | Consistency — the whole site pattern is "browse a catalog card, click through" (already true for Games and existing Tools) | LOW | Already the plan: each app is an editable Armory Tool (`status: live`) with an internal-route target, reorderable/hideable like existing tools. |

### Differentiators (Competitive Advantage)

Features that set this apart from a bare "here's a link to an external app" experience, or from typical solo/indie-studio tool pages. Not required for MVP, but valuable and low-cost enough to consider now or soon.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Consistent Nocturne shell around otherwise-freeform app internals | Reinforces "this is Darktier's tool," not a random third-party embed — the trust/consistency signal that makes in-site feel intentional rather than jarring | LOW | Already decided ("own internal look, no restyle" + shared shell). This is the core differentiator vs. simply linking out to `charlie-mike-428f0.web.app`-style separate Firebase apps. |
| Documented, reusable "drop a `.tsx` app in, register one metadata entry, it's a route" pipeline | Turns each future companion app into a content addition (data-driven, low code) rather than a bespoke integration project — directly serves the studio's actual cadence of shipping one companion per game | MEDIUM | This is the milestone's second explicit deliverable. Value is entirely in how low-friction it makes app #3, #4, #5 — worth investing real design effort here even though it doesn't show up as a user-facing feature. See Feature Dependencies below. |
| Per-app metadata schema (title, description, OG image, route slug) as a small structured extension of the existing `Tool` type | Keeps SEO/OG table-stakes coverage consistent without hand-writing `<head>` tags per app | LOW | Extends `src/lib/types.ts` `Tool` interface — e.g. add an optional `route`/`internalPath` field alongside the existing `app` (external URL) field, so a Tool can point either external or internal. Small, additive change. |
| Export/import session state as a shareable code or file (e.g. "copy session code") | Without cross-device sync, a lightweight escape hatch — "text me the code, I'll paste it on my phone" — recovers some of what sync would give, at near-zero infra cost | MEDIUM | Pure client-side (serialize localStorage state to a string/JSON blob), no backend. Good v1.x candidate once the two launch apps are stable; do not build for MVP. |
| "Add to Home Screen" affordance / minimal PWA manifest per app (icon, name) without full offline service-worker | Lets a player pin the companion to their phone home screen like a real app, reinforcing "this is a tool," without the service-worker complexity/maintenance burden | LOW–MEDIUM | A `manifest.json` + icons is cheap; a full offline-caching service worker is not needed given the app has no further network calls once loaded (see table stakes above) — this is genuinely optional polish, not required for "offline-tolerant" (which is already satisfied by localStorage + no-further-fetches). |
| A visible "reset confirmed" / last-saved indicator in the app UI | Small trust signal that state really did persist / really did clear — reduces "did that save?" anxiety at the table | LOW | Nice-to-have polish once the two launch apps exist; not required for MVP. |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create disproportionate cost or actively work against this project's constraints.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|------------------|-------------|
| Login/account required to use a companion app | "Then we could sync state across devices" — sounds like the obvious next step | Directly contradicts the project's stated no-login MVP and the studio's single-admin-only auth model; forcing account creation for a table utility is exactly the kind of friction that kills adoption of a tool meant to be opened quickly mid-game; also pulls in Firestore writes per player, which strains the free Spark-plan/no-Cloud-Functions constraint | Keep auth scoped to `/admin` only (already the architecture); defer any sync to a clearly-labeled v1.x/v2 feature, not baked into MVP |
| Full offline-first PWA with service worker + background sync | "Offline-tolerant" in the requirement sounds like it implies a real PWA | Service-worker cache-invalidation-on-deploy and storage-quota management add real, ongoing maintenance complexity (per PWA literature) for a solo maintainer, for a use case (spotty wifi at a table, not truly airplane-mode offline-first) that's already covered by localStorage + a client-only bundle with no further fetches | A plain client-rendered island with localStorage already tolerates flaky connectivity after first load; add a lightweight manifest for "add to home screen" polish only if desired later, skip the service worker |
| A generic plugin/loader system (dynamically discovered apps, runtime manifest scanning, a "companion app marketplace" architecture) | "Reusable pipeline" sounds like it implies real extensibility infrastructure | Over-engineering for a solo studio shipping ~2 apps now and a handful over years; a dynamic plugin system (runtime discovery, sandboxing, versioned APIs) adds build/security complexity with no payoff at this volume — Astro's static route + explicit registration entry per app is already "low-effort" without any of that machinery | A documented convention: new route file + one metadata object added to a typed list (mirrors how `games`/`tools`/`news` seeds already work) — build-time, explicit, reviewed by the owner, not a runtime plugin host |
| iframe-embedding the companion app instead of a native Astro/React island route | Seems like the fastest way to "host" a self-contained app inside the site | iframes fight the exact things table-stakes requires: OG/SEO crawlability of the embedded content, deep-linking to app-specific state, consistent mobile viewport/scroll behavior, and the "same site, same shell" trust signal (iframes visually read as an embedded foreign page, especially at odd aspect ratios on mobile) | Astro island rendering the app's component tree directly into the page, inside the Nocturne shell — already the chosen approach |
| Real-time multiplayer / shared session state between players' devices | Natural ask once players see two people at the table each on their own phone | Requires a backend (Firestore writes, presence, conflict resolution) — direct violation of the "no Firestore for game state, local-only" MVP constraint and the free-tier/no-Cloud-Functions cost constraint | Explicitly flag as deferred (see Gaps/differentiators-to-defer below); each player's device tracks its own local state independently for MVP |
| Rebuilding/absorbing the existing separate Firebase companion apps (Charlie Mike TOC) into this new in-site pattern as part of this milestone | Consistency ("why do some apps live in-site and some don't?") | Explicitly out of scope per PROJECT.md — Charlie Mike TOC remains a separate Firebase app, linked not absorbed; re-platforming a live, working app is unrelated risk/cost for this milestone | Leave existing external companion apps exactly as they are (external `app` URL on the Tool); the new pattern applies only to newly-built companions going forward |

## Feature Dependencies

```
Per-app Astro route + Nocturne shell (table stakes)
    └──requires──> Existing Nocturne Layout.astro + nav/footer components (v1.0, already built)
    └──requires──> Extended Tool type: internal route field alongside existing external `app` field
                       └──requires──> Existing Firestore `tools` collection + admin CRUD UI (v1.0, already built)
                                          └──enhances──> Admin can add/edit/reorder/hide the new app entries same as any Tool

Per-app OG/meta (table stakes)
    └──requires──> Existing per-page SEO/OG layout component/pattern (v1.0, already built)

Reusable app-hosting pipeline (differentiator)
    └──requires──> Per-app Astro route convention (table stakes, must exist first)
    └──requires──> Per-app metadata schema (differentiator, small type extension)
    └──enhances──> Every future companion app (#3, #4, #5) — this is the payoff, not app #1/#2 themselves

localStorage persistence + reset affordance (table stakes)
    └──conflicts with──> Cross-device sync / shared session state (deferred differentiator) — cannot have both without a backend; MVP explicitly chooses local-only

Burning Banners' Tailwind/lucide-react styling path
    └──requires──> A scoped-CSS strategy that doesn't leak into the surrounding Nocturne site or get overridden by it (heavier lift than Fate of the Fellowship's plain-CSS approach)
```

### Dependency Notes

- **Per-app routes require the existing Nocturne shell and Tool CRUD**, not new infrastructure — this milestone extends v1.0's admin/catalog system rather than building a parallel one. The roadmap should sequence "extend Tool type + admin form for internal-route apps" before or alongside the first app's route, since the admin entry and the route need to agree on a slug/path contract.
- **The reusable pipeline is a documentation + convention deliverable that rides on top of the first app's route**, not a separate system to build first. Recommend building Fate of the Fellowship's route, then extracting the pattern into the documented pipeline, then applying it to Burning Banners as validation that the pattern generalizes — rather than designing the pipeline in the abstract before any app exists.
- **localStorage-only conflicts with cross-device sync** by design for this milestone — this is a deliberate MVP boundary, not an oversight, and should be called out to the owner as a known limitation rather than silently deferred.
- **Burning Banners' styling path is the higher-risk dependency**: its ~231 Tailwind utility classes plus `lucide-react` need a scoping strategy (e.g. a CSS layer/prefix or Tailwind's `important`/scoping config) that coexists with the global Nocturne `styles.css` without either bleeding into the other. This should be resolved and validated on Burning Banners specifically, since Fate of the Fellowship (plain CSS) won't surface the conflict.

## MVP Definition

### Launch With (v1.1)

Minimum viable product — what's needed to validate the in-site pattern with the first two apps.

- [ ] Per-app internal Astro route (`/armory/<slug>`) with SSR'd shell + OG/meta — essential for the core "own crawlable URL" table stake
- [ ] Nocturne nav/footer shell wrapping each app, app keeps its own internal look — essential differentiator vs. jarring external redirect; already decided
- [ ] Extended `Tool`/admin support for an internal-route target (`status: live`, points at `/armory/<slug>` instead of/alongside external `app`) — essential so the admin can manage these like any other tool
- [ ] localStorage read/write with a namespaced key per app, survives reload — essential; this is the whole MVP state model
- [ ] Explicit in-app reset/clear-session action — essential; without it, state loss (accidental) or state staleness (no way to start fresh) breaks table use
- [ ] Mobile-responsive layout verified for both apps on phone-sized viewports — essential given stated at-the-table usage
- [ ] Fate of the Fellowship shipped as the reference "clean drop-in" case (React-only, self-contained CSS) — essential to prove the pattern before the harder app
- [ ] Burning Banners shipped with its scoped styling path resolved — essential; it's the milestone's explicit stress-test of the pattern
- [ ] Documented app-hosting pipeline (route/naming convention, registration steps, metadata requirements) written down after both apps ship — essential deliverable per PROJECT.md, but sequence it after (or alongside) the second app so it reflects lessons from both, not just the easy one

### Add After Validation (v1.x)

Features to add once the first two apps are live and the pattern is proven.

- [ ] "Add to Home Screen" manifest/icons per app — trigger: owner or players ask for a home-screen shortcut; cheap to add once app UI is stable
- [ ] Export/import session state as a copyable code — trigger: a real complaint surfaces about losing state when switching devices/browsers
- [ ] Third+ companion app built purely from the documented pipeline (no hand-holding) — trigger: this is the real validation that the "reusable pipeline" differentiator worked; treat as the acceptance test for that feature

### Future Consideration (v2+)

Features to defer until there's clear signal they're needed — explicitly NOT MVP, and should be flagged to the owner as things the localStorage-only approach will not provide.

- [ ] Cross-device sync of session state (e.g. start on phone, continue on tablet) — defer: requires Firestore writes per player + likely some auth, which conflicts with the "no login" and free-tier/no-Cloud-Functions constraints; only build if demand is explicit
- [ ] Shared/multiplayer session state (all players at a table see the same live state) — defer: same backend requirement as sync, plus real-time infra (listeners/presence); significant scope and cost jump from a static local tool
- [ ] Full offline-first PWA (service worker, works with zero network ever, works during initial-load-time network loss) — defer: the MVP's "no further fetches after load" already covers the realistic at-the-table connectivity problem; true offline-first is solving a different, less likely problem (no network on very first visit) at real ongoing maintenance cost
- [ ] Dynamic/runtime plugin system for companion apps — defer indefinitely unless app count grows into the dozens; the static route + registration convention scales fine for a solo studio's realistic output

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Per-app internal route + OG/meta | HIGH | LOW | P1 |
| Nocturne shell wrap (nav/footer, own internal look) | HIGH | LOW | P1 |
| Extended Tool type + admin support for internal routes | HIGH | LOW | P1 |
| localStorage persistence + reset affordance | HIGH | LOW | P1 |
| Mobile-responsive verification per app | HIGH | MEDIUM | P1 |
| Burning Banners scoped styling path | MEDIUM | HIGH | P1 (required for this milestone's second app) |
| Documented reusable pipeline | MEDIUM (owner-facing, not player-facing) | MEDIUM | P1 |
| "Add to Home Screen" manifest | LOW–MEDIUM | LOW | P2 |
| Export/import session code | LOW–MEDIUM | MEDIUM | P2 |
| Cross-device sync | MEDIUM (if requested) | HIGH | P3 |
| Shared/multiplayer live state | LOW (niche vs. cost) | HIGH | P3 |
| Full offline-first PWA / service worker | LOW (marginal over current model) | HIGH | P3 |
| Dynamic plugin/runtime-discovery system | LOW | HIGH | P3 (anti-feature at current scale) |

**Priority key:**
- P1: Must have for this milestone's launch
- P2: Should have, add once the two launch apps are stable and validated
- P3: Nice to have / explicitly deferred, only revisit on clear demand signal

## Competitor Feature Analysis

Direct precedent for "solo tabletop-game studio hosts a catalog of in-site launchable browser companion apps" is genuinely thin (see Gaps) — most comparable examples fall into two adjacent-but-different categories: published companion apps for board games (nearly always native App Store/Play Store apps, not browser tools) and general game-dev tool hub sites (which link out to individually-hosted external tools/pages rather than embedding them in a consistent site shell).

| Feature | Native companion apps (e.g. Mansions of Madness, Clank!) | Generic game-dev tool hubs (gamedevtools-style aggregators) | Our Approach |
|---------|-----------------------------------------------------------|----------------------------------------------------------------|--------------|
| Hosting model | Dedicated App/Play Store app per game, separate install | Aggregator site linking OUT to many separately-hosted external tools | In-site Astro route, same origin/deploy as the marketing site — closer to neither; most similar to embedding a widget directly in the parent site's own shell |
| Cross-device state | Yes, via account/cloud save (these are commercial, funded apps with backend budget) | N/A (each tool manages its own, inconsistently) | Explicitly deferred (localStorage-only MVP) — smaller scope, matches solo/free-tier constraints |
| Visual consistency with "home" site | N/A — app has its own branding entirely | None — each linked tool looks like whatever its own site looks like | Own internal look INSIDE the shared Nocturne shell — a deliberate middle ground neither precedent offers |
| Discoverability | App store search/browse | Grid/list of cards on the aggregator page | Armory catalog card → in-site route, same interaction model as existing Games/Tools cards (consistent with what the site's users already expect from v1.0) |
| Adding a new one (studio's effort) | Full app-store submission cycle, native build pipeline | Just add a link/entry | Astro route + one Tool metadata entry — closer to the tool-hub aggregator's low cost, without losing in-site consistency |

## Sources

- [The best board game companion apps for iPhone and iPad (AppleInsider)](https://appleinsider.com/articles/20/12/26/the-best-board-game-companion-apps-for-iphone-and-ipad) — MEDIUM confidence (secondary roundup, cross-checked against BGG geeklist)
- [Official Companion Apps for Board Games (BoardGameGeek geeklist)](https://boardgamegeek.com/geeklist/253032/official-companion-apps-for-board-games-android-an) — MEDIUM confidence, community-curated but consistent with other roundups
- [How to Persist React State in Local Storage — Felix Gerschau](https://felixgerschau.com/react-localstorage/) and related React/localStorage pattern articles (UXPin, Medium, Bits and Pieces, xJavaScript) — MEDIUM confidence, consistent consensus across many independent 2025-26 sources
- [Islands architecture — Astro Docs](https://docs.astro.build/en/concepts/islands/) — MEDIUM confidence (official docs via web search snippet, not direct fetch, but content matches well-established Astro documentation)
- [Astro Islands Architecture Explained (OpenReplay)](https://blog.openreplay.com/astro-islands-architecture-explained/), [Astro Island Architecture Demystified (SoftwareMill)](https://softwaremill.com/astro-island-architecture-demystified/) — MEDIUM confidence, corroborating third-party explainers
- [Frontend System Design: Offline Support and PWAs (DEV Community)](https://dev.to/zeeshanali0704/frontend-system-design-offline-support-and-progressive-web-apps-pwas-4k8m), [What are the pros and cons of service workers in PWAs? (Educative)](https://www.educative.io/answers/what-are-the-pros-and-cons-of-using-service-workers-in-pwas) — MEDIUM confidence, consistent on service-worker complexity tradeoffs
- [The Widget Registry: How to Serve Reusable Interactive Content Pieces (Lullabot)](https://www.lullabot.com/articles/widget-registry-how-serve-reusable-interactive-content-pieces), [widget-registry-boilerplate (GitHub)](https://github.com/js-widgets/widget-registry-boilerplate) — MEDIUM confidence, general micro-frontend/widget-registry convention pattern, not tabletop-specific
- [Okta: redirect vs. embedded deployment models](https://developer.okta.com/docs/concepts/redirect-vs-embedded/), [Auth0: Hosted vs. Embedded Login](https://auth0.com/docs/authenticate/login/universal-vs-embedded-login) — LOW confidence for this project's use case (source domain is auth/security, only loosely transferable to same-origin in-site tool launches; used only for the general "consistent chrome signals trust" inference, not as authoritative UX guidance)
- Game-dev tool hub aggregator sites (gamedevtools.net-style) and game studio website templates (Webflow/ThemeForest listings) — LOW confidence; weak, indirect precedent only, no confirmed example of a solo tabletop studio doing exactly this in-site companion-app pattern found

---
*Feature research for: In-site-hosted companion web apps (Darktier Studios v1.1)*
*Researched: 2026-08-18*
