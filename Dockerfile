# Coolify builds this as-is. The repo must contain a pnpm lockfile (the launcher installs once
# and commits it). `@bluebulb` packages come from the registry in .npmrc.
FROM node:24-slim AS base
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate
WORKDIR /app

FROM base AS build
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm build

FROM node:24-slim
ENV NODE_ENV=production
ENV PORT=3300
ENV HOSTNAME=0.0.0.0
WORKDIR /app
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
# The app reads bluebulb.json from its working directory at runtime, next to server.js.
COPY --from=build --chown=node:node /app/bluebulb.json ./bluebulb.json
USER node
EXPOSE 3300
CMD ["node", "server.js"]
