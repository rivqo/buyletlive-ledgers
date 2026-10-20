# Example

A staff app generated from the BlueBulb app template. It starts as a product in its owner's brand: sign-in, a dashboard, a design page, users and roles, and a help centre with a tour for every page. Add product screens under `app/(app)/`; [AGENTS.md](AGENTS.md) says how.

## Run it locally

1. Register the app in the console under **Platform and access → App access**, with `app` from `bluebulb.json` as its key (or, without it, the `name` with only its letters: `hr-portal` is `hrportal`). A launched app is registered already. An unregistered app lets everyone in and has no owners or roles, so register it before anyone else uses it.
2. Create an OIDC client for it in Zitadel (redirect URI `http://localhost:3300/auth/callback`) and copy `.env.example` to `.env.local` with the client's values and a random `AUTH_SESSION_SECRET`.
3. Set `PLATFORM_API_URL` and a test key in `PLATFORM_API_KEY` with `platform:access:write` (so the app can send its roles on start) and, when `bluebulb.json` lists `platform`, `platform:webhooks:read`. When it lists `email`, set `EMAIL_API_URL` and `EMAIL_API_KEY` (a key with an `email:` send scope). The launcher (step 07) will issue these; never commit them.
4. Install and start:

```bash
pnpm install
pnpm dev
```

The app is on http://localhost:3300.

## Checks

`pnpm typecheck && pnpm test && pnpm format:check && pnpm docs:check && pnpm tours:check && pnpm build`, the same as CI.

Rules for this project are in [AGENTS.md](AGENTS.md).
