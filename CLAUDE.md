# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack

NestJS 12 + TypeORM (Postgres + 2x MSSQL) + Passport JWT + `@nestjs/swagger` + `@nestjs/storage` + `@nestjs/schedule`. Package manager: **yarn**. Tests: **vitest** (not Jest). Lint: **oxlint** (type-aware; `no-floating-promises` is an error, `no-explicit-any` off). Prettier: single quotes, trailing commas.

Code comments, API messages, and Swagger texts are in **Spanish**.

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
yarn test:e2e                 # **/*.e2e-spec.ts (vitest.config.e2e.ts); needs live DBs
```

Swagger UI: `http://localhost:3000/api/docs` (bearer auth enabled).

Setup: copy `.env.example` -> `.env`. Besides `APP_*`, `DB_*`, `JWT_SECRET`, it needs `MSSQL_*`, `ZKBIO_*`, `STORAGE_*`/`AWS_*`/`S3_*`, `MS_GRAPH_*`. `.env.example` is **missing** the fincas vars read in code: `MSSQL_FINCAS_HOST/PORT/NAME/USERNAME/PASSWORD`, `MSSQL_FINCAS_BASE_URL`, `MSSQL_FINCAS_TOKEN`, `MSSQL_FINCAS_TLS_REJECT_UNAUTHORIZED`. For local dev without AWS set `STORAGE_DRIVER=local` + `STORAGE_SIGNING_KEY` (>= 32 chars).

## Module system (ESM)

`package.json` has `"type": "module"` and tsconfig uses `module: nodenext`. All relative imports **must include the `.js` extension** (e.g. `import { User } from './entities/user.entity.js'`). `main.ts` uses top-level `await bootstrap()`.

## Architecture

The API is an admin layer over two third-party biometric systems: **ZKBioAccess** (access control, plant employees) and **BioTime** (attendance, "finca"/farm employees). It reads their databases directly and writes through their HTTP APIs.

### Three TypeORM connections (`src/app.module.ts`)

| Connection | Name const (`common/constants/connections.ts`) | Owns | synchronize |
|---|---|---|---|
| Postgres (default) | — | app's own tables: `User`, `Task`, `Photo` | only when `APP_ENV=dev` (no migrations exist) |
| MSSQL ZKBioAccess | `MSSQL_CONNECTION` | `pers_person`, `pers_position`, `auth_department`, `acc_*`, `pers_leaveperson`, `acc_transaction` | never |
| MSSQL BioTime | `MSSQL_FINCAS_CONNECTION` | `personnel_*`, `iclock_terminal` | never |

- MSSQL entities map **existing third-party tables** (`@Entity('pers_person')` etc.) — never change their schema. Register them with `TypeOrmModule.forFeature([...], MSSQL_CONNECTION)` and inject with `@InjectRepository(Entity, MSSQL_CONNECTION)`; omitting the connection name silently targets Postgres.
- Pattern for writes to external systems: call the vendor API, then (optionally) patch app-specific columns via the MSSQL repo (e.g. `EmployeesService.create` -> `ZkBioaccessService` -> `employeeRepository.update({ position_id })`).

### External HTTP clients (`src/common/config/`)

- `Http`: axios for ZKBioAccess (`ZKBIO_BASE_URL`), appends `access_token` query param. Used by `employees/services/zkbioaccess.service.ts` (implements abstract `ZkBioaccessDatasource`).
- `HttpFincas`: axios for BioTime (`MSSQL_FINCAS_BASE_URL`), `Authorization: Token ...` header. Used by `biometrics/services/biotime.service.ts` (implements `BiotimeServiceDatasource`); `BiometricsModule` exports `BiotimeService` for `employees-finca`, `departments`, etc.
- `EmailService`: Microsoft Graph sendMail; HTML templates in `common/emails/`.

### Deferred tasks (`src/tasks/`)

`POST /api/tasks/upload/:type` takes an Excel file (exceljs) and stores `Task` rows (types: creation, inactivate, movement) in Postgres. `CronService` runs daily at 05:00 America/Guatemala, executes pending tasks against ZKBioAccess, and sets status `completed`/`failed` + `last_error`.

### Storage (`common/config/storage.config.ts`)

Two disks: `photos` (employee photos, key `<pin>.jpg`) and `private` (default). Driver `s3` or `local`. Inject with `@InjectDisk('photos')`. Photo URLs served via `/api/photos/:key`.

### Common (`src/common/`)

`CommonModule` exports `DatabaseHelpers`, `Filters`, `IdGeneratorService`, `DateHandlerService`, `Http`, `HttpFincas`, `EmailService`. Import it in feature modules.

- `DatabaseHelpers.handleExeptions(error)` — Postgres unique violation (`23505`) -> 400, else 500. Services also commonly use `if (error instanceof HttpException) throw error;` in catch blocks before wrapping in 500.
- List endpoints: query DTO extends `PaginationDto` (`limit`/`offset`), `Filters.buildWhere<Entity, Dto>(dto, { like: [...], date: [...] })` builds the TypeORM `where` (date fields accept `YYYY-MM-DD`, `from,to`, or ISO), then `findAndCount` + `paginate(data, total, limit, offset)`. Document with `@ApiPaginatedResponse(Model, desc)`.

### Auth (`src/auth/`)

- `JwtStrategy` validates bearer payload `{ id }`, loads `User` from Postgres, rejects inactive users; result is `req.user`.
- `@Auth(...roles: ValidRoles[])` = `RoleProtected` + `AuthGuard()` + `UserRoleGuard`. No roles = any authenticated user. Use it instead of wiring guards manually. Feature modules must import `AuthModule` to use it.
- `@GetUser()` returns `req.user` (passed to services for audit fields like creator/updater name).
- `ValidRoles`: `admin`, `rrhh`, `user` (`auth/interfaces/interfaces.ts`).
- Password hashing via `AuthEncryptationService` (bcrypt) implementing abstract `AuthEncryptionService`.

### Feature module conventions

- Folders: `dto/`, `entities/`, `interfaces/`, `resources/` (sometimes `resource/` or `responses/`), `services/`, `helpers/`.
- Never return entities directly. `resources/*.resource.ts` are static mapper classes (`Resource.collection(entities)`) returning plain objects typed by `interfaces/`; `resources/*.response.ts` are Swagger classes (`@ApiProperty`) implementing those interfaces, used in `@ApiOkResponse({ type })`.
- Controllers are fully documented with Swagger decorators (`@ApiTags`, `@ApiOperation`, `@ApiParam`, error responses). The `/documentation [module]` skill in `.claude/skills/documentation/` does this for a module.
- File uploads: `FileInterceptor` with filters from `common/helpers/` (`imageFilter`, xlsx filter).
- Circular deps exist (`EmployeesModule` <-> `InactiveEmployeesModule`) via `forwardRef`.

## Known state

- `test/app.e2e-spec.ts` is the Nest scaffold test (expects `GET /` -> "Hello World!"); there is no AppController, so it fails as-is.
- No unit tests exist yet.
