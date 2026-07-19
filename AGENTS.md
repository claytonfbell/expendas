# AGENTS.md — Expendas

## Commands

```bash
npm run dev        # Start dev server (port 3000)
npm run build      # Production build → .output/ (Nitro)
npm run start      # Serve production build from .output/
npm run release    # Bump version + changelog (standard-version)
```

No `test`, `lint`, or `typecheck` scripts exist. Use `npx tsc --noEmit` to typecheck.

## Environment

- `.env` is **required** (loaded via `dotenv/config` in `src/components/server/prisma.ts`). `.env.example` is the template. `.env` is gitignored but exists locally with live production secrets — never commit it.
- Node **v24** (`.nvmrc`: `v24.1.0`)
- `.npmrc`: `legacy-peer-deps=true`

## Tech Stack

| Layer        | Tech                                                         |
| ------------ | ------------------------------------------------------------ |
| Framework    | **TanStack Start** (SSR, file-based routes in `src/app/`)    |
| Server       | Nitro 3.x (beta) — production output to `.output/`           |
| Router       | TanStack Router — `src/routeTree.gen.ts` is **auto-generated**, never edit it |
| DB           | PostgreSQL via **Prisma 7.8**, using `@prisma/adapter-pg` (not default query engine) |
| Auth         | iron-session (cookie-based), `SECRET_COOKIE_PASSWORD` env var |
| UI           | MUI v9 + Emotion + `material-ui-pack` (dark mode)            |
| Charts       | Recharts v3                                                  |
| DnD          | @dnd-kit/react v0.5                                          |
| Email        | SendGrid                                                     |
| Integrations | Plaid, Fidelity IMAP scrape, Backblaze B2 (S3-compatible)    |

## Architecture

- **Routes**: `src/app/` — TanStack Start file-based routes. Both page routes and API routes live here (e.g., `src/app/api/organizations.$id.ts`). Root layout is `src/app/__root.tsx`.
- **API client**: Custom `Rest` class at `src/components/api/rest.ts`. Base URL set to `/api` in root layout. All API hooks in `src/components/api/hooks/` use this client.
- **Server utils**: `src/components/server/` — Prisma client singleton, session management, validation, email, Plaid, IMAP scraping, etc. These are imported by API route handlers.
- **DB migrations**: `npx prisma migrate deploy` runs in production/staging via shell scripts. Prisma is generated (`npx prisma generate`) during Docker build.

## Deployment

- Manual Docker-based, no CI/CD. `deploy.sh`: `git pull` → `docker build` → stop/rm old container → `docker run`.
- Production server runs on `10.7.7.12:3000` behind nginx reverse proxy with certbot SSL.
- Run migrations separately: `./run-production-migrations.sh` or `./run-staging-migrations.sh`.

## Feature Specs

`prompt-instructions/*.md` contains specifications for API keys, assets, meals-out, user preferences, and tasks (drag-and-drop reordering). Reference these when working on those features.

## Conventions

- Prettier: no semicolons, double quotes, trailing commas ES5, LF line endings
- ESLint config is minimal (only disables `no-explicit-any`)
- VSCode: format on save, organize imports on save
- Fallow (`npx fallow`) for dead code and duplicate detection; config in `.fallowrc.json`
