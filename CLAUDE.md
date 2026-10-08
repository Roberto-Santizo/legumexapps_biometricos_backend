# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Package manager: **yarn**.

- `docker-compose up -d` — start Postgres 18 (data persisted in `./postgres`, reads `DB_PASSWORD`/`DB_NAME` from `.env`)
- `yarn start:dev` — run API in watch mode (port `PORT` or 3000)
- `yarn build` — `nest build` to `dist/`
- `yarn lint` — oxlint, type-aware (`no-floating-promises` is an error)
- `yarn format` — prettier on `src/` and `test/`
- `yarn test` — vitest unit tests (`**/*.spec.ts`)
- `yarn test:e2e` — vitest with `vitest.config.e2e.ts` (`**/*.e2e-spec.ts`, needs a live DB)
- Single test: `yarn vitest run path/to/file.spec.ts` or `yarn vitest run -t "test name"`

Setup: copy `.env.example` to `.env` (README says `.env.template`, but the file is `.env.example`).

## Stack / conventions

- NestJS 12 + TypeORM (Postgres) + class-validator, running as **native ESM** (`"type": "module"`, `module: nodenext`). Relative imports **must** use the `.js` extension (e.g. `import { User } from './entities/user.entity.js'`). `main.ts` uses top-level `await`.
- Tests use **vitest** (globals enabled), not Jest.
- User-facing error messages are written in Spanish.

## Architecture

- `src/main.ts`: global prefix `/api`; global `ValidationPipe` with `whitelist` + `forbidNonWhitelisted` (unknown body/query props → 400). DTOs must declare every accepted field with class-validator decorators.
- `src/app.module.ts`: `ConfigModule.forRoot()` loads `.env`; `TypeOrmModule.forRoot` reads `process.env` directly with `autoLoadEntities: true` and `synchronize: true` (schema auto-synced from entities; no migrations). Note it reads `DB_USERNAME`, while `.env.example` lists `DB_USER`.
- Feature modules (e.g. `src/users/`) follow the Nest resource layout: `*.module.ts` registers entities via `TypeOrmModule.forFeature`, service injects `Repository<Entity>` with `@InjectRepository`, `dto/` holds create DTO + `PartialType` update DTO.
- `src/common/`: shared pieces, e.g. `PaginationDto` (`limit`/`offset` query params, coerced via `@Type(() => Number)`); services default to `limit=10, offset=0`.
- Services translate Postgres unique-violation (`23505`) to `BadRequestException` in a private `_handleDbExceptions` helper.
- `@nestjs/authentication` is installed but its module is commented out in `AppModule`; no auth yet. Password hashing is a TODO in `UsersService.create`.
- `test/app.e2e-spec.ts` is the unmodified Nest scaffold (expects `GET /` → "Hello World!"), which no longer matches the app.
