# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

---

## Walia Coder CLI

Rebranded AI coding assistant built from the claude-code source archive.

### Key facts
- **Command:** `walia` (also `walia-coder`)
- **Binary:** `walia-coder/dist/cli.js` (28 MB Bun bundle)
- **Symlink:** `~/.local/bin/walia` → `walia-coder/dist/cli.js`
- **Config dir:** `~/.walia-coder/`
- **API key env var:** `WALIA_API_KEY` (mapped internally to `ANTHROPIC_API_KEY` at startup)
- **Version:** `1.0.0 (Walia Coder)`

### Build system
Located in `walia-coder/`. Uses Bun 1.3.6.

```bash
cd walia-coder && bun install && bun run build.ts
```

The `build.ts` script uses four custom Bun plugins:
1. `bun-bundle-stub` — stubs `bun:bundle` so `feature()` returns `false` (disables internal Anthropic gates)
2. `src-alias` — resolves bare `src/*` imports through the `walia-coder/src` symlink
3. `react-compiler-alias` — maps `react/compiler-runtime` to `react-compiler-runtime`
4. `js-resolver` + `js-loader` — handles `.js` → `.ts` resolution for both dynamic `require()` and static imports

### Private package stubs (graceful no-ops)
Five Anthropic-internal packages are stubbed in `walia-coder/stubs/`:
- `@ant/computer-use-mcp` — computer use MCP server (disabled)
- `@ant/computer-use-swift` — Swift screenshot/input native module (disabled)
- `@ant/computer-use-input` — Rust keyboard/mouse native module (disabled)
- `@ant/claude-for-chrome-mcp` — Chrome browser integration (disabled)
- `@anthropic-ai/mcpb` — MCPB manifest handler (disabled)

All stubs use CJS `module.exports = Proxy(...)` so any named import is satisfied without crashing.

### Source layout
- `src/` (workspace root) — extracted claude-code TypeScript source (2203 files)
- `walia-coder/src` — symlink to `../src` (so Bun's node_modules resolver finds `walia-coder/node_modules`)
- `src/node_modules` — symlink to `walia-coder/node_modules` (for resolver walk from real source paths)

---

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server (JWT + RBAC)
│   └── walia-nexus/        # React/Vite SaaS frontend (marketing + dashboard)
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts (single workspace package)
│   └── src/                # Individual .ts scripts, run via `pnpm --filter @workspace/scripts run <script>`
├── pnpm-workspace.yaml     # pnpm workspace (artifacts/*, lib/*, lib/integrations/*, scripts)
├── tsconfig.base.json      # Shared TS options (composite, bundler resolution, es2022)
├── tsconfig.json           # Root TS project references
└── package.json            # Root package with hoisted devDeps
```

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references. This means:

- **Always typecheck from the root** — run `pnpm run typecheck` (which runs `tsc --build --emitDeclarationOnly`). This builds the full dependency graph so that cross-package imports resolve correctly. Running `tsc` inside a single package will fail if its dependencies haven't been built yet.
- **`emitDeclarationOnly`** — we only emit `.d.ts` files during typecheck; actual JS bundling is handled by esbuild/tsx/vite...etc, not `tsc`.
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references` array. `tsc --build` uses this to determine build order and skip up-to-date packages.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages that define it
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## Packages

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. Routes live in `src/routes/` and use `@workspace/api-zod` for request and response validation and `@workspace/db` for persistence.

- Entry: `src/index.ts` — reads `PORT`, starts Express
- App setup: `src/app.ts` — mounts CORS, JSON/urlencoded parsing, routes at `/api`
- Routes: `src/routes/index.ts` mounts sub-routers; `src/routes/health.ts` exposes `GET /health` (full path: `/api/health`)
- Depends on: `@workspace/db`, `@workspace/api-zod`
- `pnpm --filter @workspace/api-server run dev` — run the dev server
- `pnpm --filter @workspace/api-server run build` — production esbuild bundle (`dist/index.cjs`)
- Build bundles an allowlist of deps (express, cors, pg, drizzle-orm, zod, etc.) and externalizes the rest

### `lib/db` (`@workspace/db`)

Database layer using Drizzle ORM with PostgreSQL. Exports a Drizzle client instance and schema models.

- `src/index.ts` — creates a `Pool` + Drizzle instance, exports schema
- `src/schema/index.ts` — barrel re-export of all models
- `src/schema/<modelname>.ts` — table definitions with `drizzle-zod` insert schemas (no models definitions exist right now)
- `drizzle.config.ts` — Drizzle Kit config (requires `DATABASE_URL`, automatically provided by Replit)
- Exports: `.` (pool, db, schema), `./schema` (schema only)

Production migrations are handled by Replit when publishing. In development, we just use `pnpm --filter @workspace/db run push`, and we fallback to `pnpm --filter @workspace/db run push-force`.

### `lib/api-spec` (`@workspace/api-spec`)

Owns the OpenAPI 3.1 spec (`openapi.yaml`) and the Orval config (`orval.config.ts`). Running codegen produces output into two sibling packages:

1. `lib/api-client-react/src/generated/` — React Query hooks + fetch client
2. `lib/api-zod/src/generated/` — Zod schemas

Run codegen: `pnpm --filter @workspace/api-spec run codegen`

### `lib/api-zod` (`@workspace/api-zod`)

Generated Zod schemas from the OpenAPI spec (e.g. `HealthCheckResponse`). Used by `api-server` for response validation.

### `lib/api-client-react` (`@workspace/api-client-react`)

Generated React Query hooks and fetch client from the OpenAPI spec (e.g. `useHealthCheck`, `healthCheck`).

### `scripts` (`@workspace/scripts`)

Utility scripts package. Each script is a `.ts` file in `src/` with a corresponding npm script in `package.json`. Run scripts via `pnpm --filter @workspace/scripts run <script>`. Scripts can import any workspace package (e.g., `@workspace/db`) by adding it as a dependency in `scripts/package.json`.

---

## Environment Variables & Secrets

| Variable | Required | Description |
|---|---|---|
| `GITHUB_PAT` | Yes (for GitHub sync) | Personal Access Token with `repo` scope. Used by `scripts/push-to-github.sh` to authenticate pushes. |
| `GITHUB_REPO` | No | Target GitHub repository in `owner/repo` format. Defaults to `Waliaexpress/Walia-coder`. Override to push to a fork or different repo. |
| `GITHUB_BRANCH` | No | Target branch for GitHub sync. Overrides the hard-coded default but is itself overridden by the positional argument passed to the script. |
| `DATABASE_URL` | Yes | PostgreSQL connection string. Provided automatically by Replit. |
