# How changes land

`develop` is what dev and staging run. `main` is production and updates from `develop` only at a release. A new service, a tenancy or auth change, an API version, or a new ADR goes on `arch/<topic>` and merges back to `develop`.

Commit a finished task with a message that says why. The same commit updates `CHANGELOG.md`. Do not commit `.env` files, secrets, or build output. Do not push unless asked.

Decisions go in `docs/adr/`. Why they are worth building goes in `docs/business/`. How to change a feature goes in `docs/guides/`.
