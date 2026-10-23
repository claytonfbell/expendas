# AGENTS.md — Expendas

## Commands

```bash
npm run dev        # Dev server (port 3000, Vite + TanStack Start)
npm run build      # Production build → .output/ (Nitro)
npm run start      # Serve production build (node .output/server/index.mjs)
npm run release    # Bump version + changelog (standard-version)
npm run prettier   # Format all .ts/.tsx
```

No `test`, `lint`, or `typecheck` scripts exist. Use `npx tsc --noEmit` to typecheck.

## Environment

- `.env` is **required** (loaded via `dotenv/config` in `src/components/server/prisma.ts`). `.env.example` is the template. `.env` is gitignored but exists locally with live production secrets — never commit it.
- `.env.example` is incomplete and has a casing bug: code reads `PLAID_CLIENT_ID` but the template says `PLAID_CLIENT_id`. It also omits vars the code reads: `S3_ENDPOINT` / `AWS_REGION` / `AWS_BUCKET_NAME` (cloud files & backups), `GIPHY_API_KEY` (email digest), `MASSIVE_API_KEY` (ticker price backfill).
- In non-production, all outgoing email is redirected to `DEV_OVERRIDE_EMAIL` (`src/components/server/sendEmail.ts`).
- Node **v24** (`.nvmrc`: `v24.1.0`); `.npmrc`: `legacy-peer-deps=true`

## Tech Stack

| Layer        | Tech                                                         |
| ------------ | ------------------------------------------------------------ |
| Framework    | **TanStack Start** (SSR, file-based routes in `src/app/`)    |
| Server       | Nitro 3.x (beta) — production output to `.output/`           |
| Router       | TanStack Router — `src/routeTree.gen.ts` is **auto-generated**, never edit it |
| DB           | PostgreSQL via **Prisma 7.8**, using `@prisma/adapter-pg` (not default query engine) |
| Auth         | iron-session (cookie-based), `SECRET_COOKIE_PASSWORD` env var |
| UI           | MUI v9 + Emotion + `material-ui-pack` (`DarkModeProvider` in root layout) |
| Data fetch   | TanStack Query (`useSuspenseQuery`) + custom `Rest` client   |
| Integrations | Plaid, Fidelity IMAP scrape, S3-compatible object storage (`S3_ENDPOINT`) |

## Architecture

- **Routes**: `src/app/` — page routes at top level, root layout `src/app/__root.tsx`.
- **API routes** live in `src/app/api/` as TanStack Start server handlers: `export const Route = createFileRoute("/api/organizations/$id")({ server: { handlers: { GET: ... } } })` (`$` prefix = URL param). Follow the established pattern:
  - Wrap handler logic in `buildResponse(request, async (session) => ...)` (handles session + error mapping).
  - Auth via `requireAuthentication` / `requireAdminAuthentication` (`src/components/requireAuthentication.ts`); authorization checks against org membership.
  - Throw `HttpException` subclasses (`NotFoundException`, `ForbiddenException`, `BadRequestException` from `src/components/server/HttpException.ts`) — don't return raw error responses.
- **API client**: `Rest` singleton at `src/components/api/rest.ts`, base URL set to `/api` in `__root.tsx`. All hooks in `src/components/api/hooks/` wrap it with React Query; shared keys in `hooks/queryKeys.ts`. Naming: `useFetch*`, `useAdd*`, `useUpdate*`, `useRemove*`, `useReorder*`.
- **Server utils**: `src/components/server/` — Prisma client singleton, session, validation, email, Plaid client, IMAP scraping, S3 cloud files. Imported by API route handlers.
- **DB**: schema `prisma/schema.prisma`, migrations `prisma/migrations/`. `npx prisma generate` runs during Docker build.

## Deployment

- Manual Docker-based, no CI/CD. `deploy.sh`: `git pull` → `docker build` → stop/rm old container → `docker run` → prune. Production runs on `10.7.7.12:3000` behind nginx + certbot.
- The Dockerfile **copies `.env` into the image** (`.dockerignore` only excludes `node_modules/` and `.next/`), so `docker build` requires a local `.env`.
- Migrations run separately: `./run-staging-migrations.sh` (tracked) or `./run-production-migrations.sh` (**gitignored** — contains prod credentials, exists only on local machines).
- `copy-staging-db.sh` / `copy-backup-db.sh` refresh the staging/backup DBs from the production DB over SSH (host alias `expendas`, uses `PGPASSWORD` from `.env`).

## Feature Specs

`prompt-instructions/*.md` — specs for API keys, assets, meals-out, user preferences, and tasks (drag-and-drop reordering). Reference these when working on those features.

## Conventions

- Prettier: no semicolons, double quotes, trailing commas ES5, LF line endings (also `npm run prettier`)
- ESLint is minimal — its only rule disables `@typescript-eslint/no-explicit-any`
- Fallow (`npx fallow`) for dead-code/duplicate/complexity checks; config in `.fallowrc.json` (route `Route` exports and hook-family duplicates are intentionally ignored)
- VSCode: format on save, organize imports on save
