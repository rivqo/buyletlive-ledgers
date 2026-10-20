# BlueBulb Platform: engineering standards

This file is the single source of rules for humans and AI coding agents (Cursor reads it
directly; `CLAUDE.md` imports it). `.cursor/rules/` adds the definition of done and per-area rules
learned from review; `pnpm check:standards` checks what a script can. Decisions and their reasons live in `docs/adr/`.
How changes are branched, committed, and documented lives in `docs/workflow.md`.
To run the stack on a machine, follow [LAUNCH.md](LAUNCH.md) exactly and stop when its checks pass.

## Repo map

- `apps/console`: Next.js console for managing and monitoring services.
- `apps/login`: staff sign-in screens on top of Zitadel (ADR 0015).
- `apps/docs`: internal docs. Guides come from each `services/*/docs/` and `apps/*/docs/` folder, API
  references from each `openapi.yaml` (ADR 0016).
- `services/platform-api`: control plane. Companies/SBUs + brand profiles, platforms, tenants,
  console users/roles, API keys, service registry, entitlements, webhook endpoints, audit log.
- `services/comms-email`: email delivery with provider failover, test mode, tracking.
- `services/directory`: staff directory. People, groups and org structure synced from Google Workspace (ADR 0017). Not a tenant of a platform.
- `packages/comms-kit`: shared code for comms channel services (pg-boss queues, provider failover,
  outbox drain and webhook delivery, log redaction). Plan: `docs/comms/README.md`, ADR 0011.
- `packages/core`: framework-free primitives (IDs, API keys, webhook signing, errors, env, policy).
- `packages/service-kit`: NestJS pieces every service uses (auth guard, errors, health, bootstrap).
- `packages/tokens`: design tokens → CSS variables + Tailwind v4 theme, contrast checks, tenant branding.
- `packages/staff-auth`: staff sign-in for Next.js apps through Zitadel (session, roles, sign-out).
- `packages/ui`: shared React components (Radix primitives + tokens), including charts. Gallery at `/design` in the console.
- `packages/config`: shared tsconfig / ESLint / Prettier.

## Language and stack

- TypeScript everywhere, strict mode. Node 24 LTS (see `.nvmrc`).
- Services: NestJS on Fastify, zod for validation, Drizzle + Postgres.
- Apps: Next.js App Router + Tailwind v4 using `@bluebulb/tokens` and `@bluebulb/ui`.
- Tests: Vitest. Pure logic (routing, signing, policy) must have unit tests.

## API rules

- REST + JSON. Every service has an OpenAPI 3.1 spec in `openapi.yaml`; update it in the same PR as the code.
  Each service's `openapi.routes.test.ts` fails when a served route isn't in the spec (or a documented
  one no longer exists), and every operation needs an `operationId` (it becomes the SDK method name).
  `pnpm lint:specs` lints all specs.
- URLs are versioned: `/v1/...`. Breaking changes need `/v2`, never silent changes.
- Errors are RFC 9457 problem+json. Throw `ProblemError` / `Problems.*` from `@bluebulb/core`.
- IDs are prefixed UUIDv7 from `newId()` (`msg_…`, `ten_…`). Register new prefixes in `packages/core/src/ids.ts`.
- Timestamps: ISO 8601 UTC. Money: integer minor units + ISO currency code.
- Every POST that creates something requires an `Idempotency-Key` header (stored 24h).
- Pagination: cursor-based (`?cursor=&limit=`), never offset. Every list endpoint paginates and returns
  `{ data, next_cursor }`, even short ones.
- JSON field names are snake_case, nested objects included. Map from Drizzle's camelCase rows in a
  view function (e.g. `src/org/views.ts`); never return a raw row.

## Tenancy and auth (non-negotiable)

- Tenant and platform come from the verified `RequestContext` (`@Ctx()`), NEVER from the request body.
- A multi-tenant platform acts for its own customer via the `Bb-Tenant-Id` header; platform-api
  verifies the tenant belongs to that platform.
- Every table has `platform_id` (and `tenant_id` where relevant). Every query filters on it.
- Protect endpoints with `@RequireScope('<service>:<action>')`. Endpoints without it are public.
- API keys: `bb_live_…` / `bb_test_…`. Only hashes are stored. Never log a key, secret, or email body.

## Settings: where a value lives

1. Code constants (`packages/core/src/policy.ts`): security invariants and hard ceilings.
2. Environment variables: per-deployment infra config, validated with zod at boot (`loadEnv`).
3. Database: tenant-adjustable values, always clamped with `clamp()` to the code bounds.
4. Encrypted database: secrets that must be read back (provider credentials, webhook secrets).
   Tenants may tighten security, never loosen it past the code bounds.

## Data and events

- State change + its event go in ONE transaction (transactional outbox: `outbox_events`).
- Webhooks: Standard Webhooks signing (`signWebhook`), at-least-once, consumers dedupe on `webhook-id`.
- Never resend an email via another provider once one has accepted it (see `routing/failover.ts`).

## Style

- Prettier config at root; run `pnpm format`. Small functions, explicit names, no `any`.
- Comment the _why_, not the what. Public functions get a one-line doc comment.
- UI copy: sentence case, plain verbs, errors say what happened and how to fix it.

## UI rules

Reasons in `docs/adr/0008-ui-system.md`. See every component and state at `/design` in the console.

**Building blocks**

- Use `@bluebulb/ui` before writing markup. If a pattern repeats in two places, add it to the package
  (with a test and a `/design` example) instead of copying classes between apps.
- Colors, type sizes, radii, shadows, motion and z-index come from tokens only. Tailwind's default
  palette is switched off; never write hex/rgb values or arbitrary colors (`bg-[#…]`) in app code.
- Change a token in `packages/tokens/src/tokens.ts`; the build fails if any text pair drops below
  WCAG AA. Never edit the generated CSS.
- Merge class names with `cn()` so a caller's `className` overrides cleanly.
- Icons: `lucide-react`, 16px (`size-4`) in controls, `aria-hidden` unless the icon is the only content.

**Color meaning**

- `primary`: the one main action per view, focus rings, selected controls. Tenants can rebrand it.
- `accent`: decoration only (current-nav bar, highlights). Never the only signal of state, never text.
- `success` / `warning` / `danger`: status only, always with a text label (color is never the sole cue).
- `text-muted` for secondary copy; it still passes AA, so don't fade text further with opacity.
- Identity tints (`IconTile`, avatars) use the categorical `chart-1…8` hues: one hue per entity or
  module, kept the same everywhere, always beside a text label. Tints identify; saturated and status
  colors are for what needs attention.

**Layout and type**

- Pages use `AppShell` + `PageHeader`: one h1 per page, headings in order (Card titles are h2/h3).
- Spacing on Tailwind's 4px scale; prefer 2, 3, 4, 5, 6, 8, 10. Body copy is `text-sm`;
  `text-xs` only for metadata and machine values, never for sentences people must read.
- Machine values (IDs, keys, URLs, code) in `font-mono`; offer `CopyField` when people will paste them.
- Every screen works at 360px wide with no horizontal page scroll; tables scroll inside `Table`.

**States: every data view handles all of them**

- Loading: `Skeleton` shapes in the final layout, `aria-busy` on the region. No full-page spinners.
- Empty: `EmptyState` saying what's missing and the action that fixes it.
- Error: `Alert tone="danger"` saying what failed and how to fix it. Toasts never carry the only error.
- No permission: say which permission is needed and who can grant it; don't hide the page silently.
- Every list paginates; pick the style by what the list is:
  - Feeds and logs (activity, delivery attempts, change history) scroll: `InfiniteScroll` loads more as
    you reach the end, with a visible "Load more" for keyboards. Rows only ever append.
  - Records people look up and act on (keys, webhook endpoints, tenants, alerts) page with
    `CursorPagination` and `pageLinks()` (`apps/console/lib/paging.ts`), so "Previous" goes back one
    page. Show the page number, never totals.
  - Pickers that need every option fetch all pages on the server; they don't paginate in the UI.
- List pages open with an overview, so people see the state of things without clicking: 3–4
  `StatTile`s (in `StatTiles`) counting what matters on that page, each linking to the filtered list
  it counts where one exists (`TileFooter href`). Then one `ListFilters` row: search first, then
  filters. Search and filters live in the URL and run on the server (`?q=` and the list's filters),
  never on the rows already loaded; changing one goes back to page one. A filter that matches nothing
  shows an `EmptyState` saying so, with "Clear filters".

**Actions and forms**

- Buttons are verbs ("Create key", "Revoke key"), never "OK", "Yes" or "Submit". One `primary` per view.
- Destructive or hard-to-undo actions use `ConfirmDialog`; add `confirmText` for deleting tenants,
  platforms, or anything with dependants. Prefer undo (toast action) for cheap reversible actions.
- Every control sits in a `Field` (label, optional hint, error). Mark the optional fields, not required ones.
- Many choices (scopes, permissions, recipients) use `MultiSelect`, not a wall of checkboxes: sections
  when the options group naturally (per service), with select-all per section; it adds search once a
  list is long. Keep it simple: a few checkboxes stay plain checkboxes.
- Long forms (more than about 8 fields, or parts that depend on earlier answers) split into steps with
  `MultiStepForm`: 3–6 steps named by what they collect, a verb on the last button. Show progress
  elsewhere with `Stepper`; pick `arrows` only for 3–5 short labels.
- Validate on blur and on submit, not on every keystroke. Keep what the user typed after an error.
- Disable a submit button only while it's pending (`loading`); otherwise let it submit and show errors.
- Secrets (API keys, webhook secrets) are shown once, masked in `CopyField secret`, with a line saying so.

**Accessibility (WCAG 2.2 AA)**

- Everything works by keyboard; focus is always visible (global `:focus-visible` ring, don't remove it).
- Click targets are at least 24×24px; labels count toward the target, so give checkboxes a `label`.
- Icon-only buttons use `IconButton` (its `label` is required). Dialogs need a `title`.
- Respect `prefers-reduced-motion` (token durations already collapse); no motion carries meaning.

**Brand style and illustrations** (reasons in `docs/adr/0024-brand-style-and-expressive-ui.md`)

- An app's look comes from its brand: colors plus `style` presets (shape, surface, illustration)
  and fonts, applied with `brandThemeCss()`. Never restyle a component in an app to change the feel;
  change the brand, or add a preset in `packages/tokens/src/style.ts`.
- Card-like panels use `Card` or `cardSurface`, never their own border and shadow classes.
- Illustrations: at most one per view, for first-run, empty, error, no-access and celebration
  moments, always beside words that say the same thing. Draw new ones only in `illus-*`, surface
  and ink tokens. Small or repeated empty states (a filter with no matches) keep an icon.
- An app's home opens with `DashboardGreeting` as its h1 (`hero` by default: a `HeroBanner` with the
  person, what's waiting and one action), and the attention panel comes straight after
  (`docs/adr/0033-dashboard-greeting-hero.md`). Never put a hero between a header and the panel.

**Theming**

- Light, dark and system are all supported; check both themes before merging UI.
- Tenant branding goes through `brandToCssVars()` only. It accepts `primary`, `accent` and their
  `-dark` variants and drops any primary that would fail contrast; neutrals and status colors are not
  tenant-adjustable (same principle as settings tiers: tenants can't loosen accessibility).
- BlackCod SBU colors live in `sbuBrands` (`packages/tokens/src/brands.ts`), logos in
  `apps/console/public/brands/`. Use them to seed brand profiles; never hard-code an SBU color in an app.

**Charts and live data** (reasons in `docs/adr/0009-data-visualization.md`)

- Pick the form before color. One headline number is a `StatTile`, a ratio to a limit is a `Meter`,
  not a one-bar chart. Trends: `LineChart`. Magnitude across categories: `BarChart`.
- Every chart sits in a `ChartFrame` with its `table` twin (`ChartDataTable`): values are never
  reachable only by color or hover. Two or more series always get a legend.
- Color by job: categorical `chart-1…8` for identity (fixed slot per entity via `series.slot`, never
  re-assigned when filters change, never a 9th color: fold into "Other" or facet); `chart-seq-*` for
  magnitude and ordered tiers; `chart-div-*` for above/below a baseline; UI status tokens only when the
  series means good/bad. Scatter, bubble and maps take at most 3 categorical series.
- Text never wears a series color; labels and values use text tokens beside a colored key.
- No dual y-axes. Two measures of different scale are two charts or indexed to a common base.
- Highlight the story with `highlight` (emphasis) instead of more colors.
- Data in motion: animate with `--bb-duration-data-*` / `ease-data` only; refetching dims the previous
  render (`refreshing`), never a skeleton flash; streaming views show `LiveIndicator`.
- Money in charts and tiles comes from minor units via `formatMoney`; counts via `formatCompact`.
- Custom chart looks go through `chartThemeToCssVars()` (validated; failing parts fall back), e.g. a
  brand's magnitude ramp from its primary. Change the default palette only in `chart.ts`: the build
  re-runs the colorblind and contrast checks.

**Dashboards** (reasons and layout in `docs/adr/0010-dashboards.md`; reference at `/design/dashboard`)

- One dashboard, one audience, one job. Title it by the job ("Email delivery"), and say in the
  description who it's for and what it answers. It must answer, in order: is anything wrong (5 seconds),
  what changed (30 seconds), why (by drilling in).
- Reading order, top to bottom: `DashboardHeader` (filters, comparison, freshness) → `AttentionPanel`
  → 3–5 `StatTile`s → main trend (2/3 width) beside `ChangeFeed` → breakdowns → detail table.
  On phones the same order stacks. Never put a chart above the attention panel.
- Color budget: chrome is neutral, data uses chart tokens, and red/amber appear only on attention items,
  breached thresholds and significant bad changes. If everything is fine, the page should look calm.

**Alert items (`AttentionPanel`)**

- Only things someone should act on. Each item says what is wrong with the entity and the number
  ("Bounce rate is 7.2% for tenant acme"), the threshold or impact, when it started, and offers one
  action with a verb. FYI items belong in `ChangeFeed`, not here.
- Severity is `critical` (act now), `warning` (act today), `info` (plan for it), always shown as icon +
  label + color. Order: open before acknowledged, then severity, then longest-running.
- The panel is always rendered; when empty it says "All clear" with when it was checked.
- More than 5 open items means a threshold is wrong: fix the rule, don't scroll the list.
- Alert rules and the chart `thresholds` share one source of values, so the line on the chart is the
  line that pages people. Require a condition to hold (e.g. 5 minutes) before alerting and to recover
  before resolving, so items don't flap. In services: evaluate with `evaluateAlert()` from
  `@bluebulb/core`, read thresholds only through the service's `resolveRule()`, and serve them to
  charts from the API (see comms-email `alerts/` and ADR 0010 "Implementation").
- Opening, acknowledging and resolving are changes: they appear in `ChangeFeed`.

**Changes (`Delta`, `ChangeFeed`, annotations)**

- One comparison period per dashboard, named in the header; every delta on the page uses it.
- Pass the comparison value (`previous`), not a precomputed %: small bases show absolute change
  ("+3", not "+300%") and changes under the noise threshold (default 5%) stay uncolored. Set
  `goodDirection` for every metric where up is bad.
- `ChangeFeed` lists metric moves past their threshold, events (deploys, config changes, failovers, key
  rotations) and alert history, newest first, split at the viewer's last visit. Titles are past tense
  and specific.
- Put the same events on the time-series charts as `annotations`, so cause and effect line up.

**Filters, freshness and failure**

- One filter row in the header, date range first; every widget, tile, alert and feed item obeys it,
  and filter state lives in the URL so views can be shared.
- Show freshness (`LiveIndicator` with `staleAfterMs` ≈ 2× the refresh interval); stale data warns.
- Each widget loads and fails on its own: an inline `Alert` with a retry in that widget, never a blank
  dashboard. Skeletons only on first load; refetches dim the previous render.
- Live updates never move a row under the pointer or reorder a list while someone is reading it.

## Documentation

- Cross-cutting decision: a new file in `docs/adr/`. Supersede an accepted ADR; do not rewrite it.
- Business reason: `docs/business/`, linked from the ADR. Skip this for a bugfix or a mechanical refactor.
- How to edit a service or package: `docs/guides/<name>.md`. Update it when the way you change the feature changes.
- Multi-slice work follows its plan in `docs/plans/` (start at its README). Tick the slice and update the step's status in the same commit.
- Changelog: `CHANGELOG.md`, a `## YYYY-MM-DD` section, one bullet, with a link to the doc above when one exists.
- A new app copies [docs/starting-an-app.md](docs/starting-an-app.md). There is no template directory yet.

## Git

- `develop` is the daily branch. Dev and staging deploy from it. Ordinary changes commit straight there.
- `main` is production. It updates from `develop` only when cutting a release. Do not start work on `main`.
- Major architecture uses `arch/<topic>` cut from `develop`: a new service or shared package, a tenancy
  or auth change, a new API version, or a new ADR. Merge it back into `develop` when the code and the ADR are both done.
- A local launch follows `LAUNCH.md` and stops when its checks pass. Do not invent extra setup, and do not run the optional seed commands unless asked.
- Agents commit a finished task without waiting for a separate commit request. The message says why.
  Do not commit `.env` files, secrets, or build artifacts. Do not push unless asked.
- The same commit updates the changelog.
