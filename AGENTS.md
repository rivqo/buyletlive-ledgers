# Example

This app was generated from the BlueBulb app template (ADR 0030). It starts as a product: a branded shell, a dashboard, a design page, users and roles pages, and a help centre with a tour for every page. Product screens go under `app/(app)/`; sign-in, the owner's brand, themes, roles and tours stay.

## Rules

- The platform's engineering standards apply here, including every UI rule (tokens, `@bluebulb/ui`, the states on every view): [AGENTS.md](docs/platform/AGENTS.md) is a copy of the platform repo's, and `.cursor/rules/` holds the same agent rules. Refresh both from the platform repo rather than editing them here.
- Project rules that differ from the platform's go in this file.
- Follow [docs/workflow.md](docs/workflow.md) for branches, commits and the changelog.

## Building a screen

1. **A permission for it.** Add it to `lib/permissions.ts` (`area:action`, with a sentence) and to
   the roles that should hold it. The app sends this to platform-api on start.
2. **The page** under `app/(app)/<path>/page.tsx`. Check the permission first:
   `if (!auth.can(session, P.x)) return <NoPermission … />`; every server action that changes
   something calls `await auth.requirePermission(P.x)` before anything else.
3. **The menu item** in `lib/nav.ts`, naming the same permission. People without it don't see it.
4. **Its tour** in `lib/tours.ts`, keyed by the path: a step for each part someone needs to find,
   pointing at `data-tour="…"` on the page. `pnpm tours:check` fails a page without one.
5. **A help topic** in `lib/help.ts` when people will ask about it.
6. Build it from `@bluebulb/ui` (the **Design** page shows every token and component in this app's
   brand). A pattern you need twice belongs in the platform's `@bluebulb/ui`, not copied here.

## This project

- `bluebulb.json` is the only project-specific config. `sbu` is the owner whose brand the app wears (loaded from platform-api, `lib/brand.ts`); `app` is its key for access and roles; `tenancy` says whether it acts for a tenant. `services` picks the generated clients: `platform` (`lib/platform.ts`) and `email` (`lib/email.ts`). Both are server only and take their keys from the environment.
- Who may use the app is its access policy; what they may do is their roles (`lib/permissions.ts`, managed on **Users** and **Roles** or in the console). There is no platform role check: product apps don't need one.
- Setting up a machine, and registering the app under App access, is in [README.md](README.md).
- `pnpm bluebulb:update` reports the template version and does not rewrite files.
- Done means `pnpm typecheck && pnpm test && pnpm format:check && pnpm docs:check && pnpm tours:check && pnpm build` pass.
