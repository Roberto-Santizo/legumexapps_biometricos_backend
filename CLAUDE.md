# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack

NestJS 12 + TypeORM (Postgres) + Passport JWT. Package manager: **yarn**. Tests: **vitest** (not Jest). Lint: **oxlint** (type-aware). Prettier: single quotes, trailing commas.

## Commands

```bash
yarn install
docker-compose up -d          # Postgres 18 on :5432, data in ./postgres; reads DB_PASSWORD/DB_NAME/APP_NAME from .env
yarn start:dev                # watch mode; serves on PORT (default 3000) under /api prefix
yarn build                    # nest build -> dist/
yarn lint                     # oxlint --type-aware src/ test/
yarn format
yarn test                     # unit tests: **/*.spec.ts
yarn test path/to/file.spec.ts        # single file
yarn test -t "test name"              # single test by name
yarn test:e2e                 # **/*.e2e-spec.ts (vitest.config.e2e.ts); needs a live DB
```

Setup: copy `.env.example` -> `.env` and fill `APP_ENV`, `APP_NAME`, `DB_*`, `JWT_SECRET`.

## Module system (ESM)

`package.json` has `"type": "module"` and tsconfig uses `module: nodenext`. All relative imports **must include the `.js` extension** (e.g. `import { User } from './entities/user.entity.js'`). `main.ts` uses top-level `await bootstrap()`.

## Architecture

- `src/main.ts`: global prefix `api`; global `ValidationPipe` with `whitelist` + `forbidNonWhitelisted` (unknown DTO fields -> 400).
- `src/app.module.ts`: `TypeOrmModule.forRoot` configured from `process.env`. `autoLoadEntities` and `synchronize` are **only enabled when `APP_ENV=dev`** — no migrations exist, so non-dev environments won't create/load schema automatically. Entities register via `TypeOrmModule.forFeature` in their feature module.
- `src/common/`: `CommonModule` exports `DatabaseHelpers.handleExeptions(error)` — maps Postgres unique violation (`23505`) to 400, else 500. Import `CommonModule` in feature modules and call it in `catch` blocks of service writes.
- `src/auth/`: register/login/check-status. Key pieces that work together:
  - `JwtStrategy` validates bearer token payload `{ id }`, loads `User` from DB, rejects inactive users; result becomes `req.user`.
  - `@Auth(...roles: ValidRoles[])` composes `RoleProtected` (sets `roles` metadata) + `AuthGuard()` + `UserRoleGuard`. No roles = any authenticated user. Use this on protected endpoints rather than wiring guards manually.
  - `@GetUser()` param decorator returns `req.user`.
  - `ValidRoles` enum (`admin`, `rrhh`, `user`) in `auth/interfaces/interfaces.ts`; `User.roles` is a Postgres text array defaulting to `['user']`.
  - Responses are shaped by static "resource" classes (`resources/user.resource.ts`) rather than returning entities directly — keeps `password` out of responses.
  - Password hashing goes through `AuthEncryptationService` (bcrypt), which implements the abstract `AuthEncryptionService`.
  - `AuthModule` exports `TypeOrmModule, PassportModule, JwtModule, JwtStrategy` so other modules can import it to use `@Auth()`.
- DTOs live in `<feature>/dto/` with an `index.ts` barrel; same for `decorators/`.

## Known state

- `test/app.e2e-spec.ts` is the Nest scaffold test (expects `GET /` -> "Hello World!"); there is no AppController, so it fails as-is.
- No unit tests exist yet.
