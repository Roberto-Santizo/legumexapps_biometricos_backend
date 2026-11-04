# SPEC 02 — Permisos (control de ausencias) de empleados

> **Estado:** Aprobado
> **Depende de:** —
> **Fecha:** 2026-11-03
> **Objetivo:** Digitalizar el formulario "Control de Ausencias" (ODC-RH-09) para registrar permisos de un día de empleados de planta, con comodín opcional, cinco firmas en imagen y validación final por firma de RRHH.

---

## Por qué existe esta spec

Hoy los permisos se registran en papel con el formulario "Control de Ausencias" (ODC-RH-09).
Se busca eliminar el papel y capturar los mismos datos y firmas en la app.
ZKBioAccess no maneja ausencias, así que el permiso vive solo en la base Postgres de la app.
Es el primer módulo que usa el disco `private` del storage, por eso define cómo se guardan y sirven las firmas.

### Mapeo del formulario

| Campo en papel | Campo en `Permission` |
| --- | --- |
| Nº 019468 | `folio` (autoincremental del sistema, no el del talonario) |
| Fecha | `date` |
| Nombre del trabajador / Código | `employee_pin` + `employee_name` |
| Área de trabajo | `department_name` (snapshot del trabajador) |
| Posición de trabajo | `position_name` (snapshot del trabajador) |
| Motivo de salida | `type` + `reason` |
| Con goce / Falta injustificada / Sin goce | `salary_status` |
| Nombre comodín | `substitute_pin` + `substitute_name` |
| Inicio de turno / Fin de turno | `shift_start` / `shift_end` |
| Firma del trabajador | `employee_signature_key` |
| Firma del comodín | `substitute_signature_key` |
| Jefe o Supervisor de Línea | `supervisor_signature_key` |
| Auditor de Piso | `floor_auditor_signature_key` |
| Vo.Bo. Recursos Humanos | `hr_signature_key` + `hr_signed_by` + `hr_signed_at` |

---

## Alcance

**Dentro:**

- Nuevo módulo `src/permissions/` con entidad `Permission` (tabla `permission` en Postgres).
- Solo empleados de planta (ZKBioAccess, `pers_person`), identificados por `pin`.
- Trabajador obligatorio y comodín opcional, ambos referencias lógicas a `pers_person.pin`.
- Un permiso cubre un solo día (`date`) con turno `shift_start`–`shift_end`.
- Tipo por enum fijo + motivo libre obligatorio + estado de salario de 3 valores.
- Cinco firmas PNG (máx 1 MB) en el disco `private`:
  - Al crear: trabajador, comodín (si hay), jefe/supervisor de línea y auditor de piso.
  - Después: Vo.Bo. de RRHH, una sola vez, en un endpoint propio.
- El permiso es válido solo cuando tiene la firma de RRHH. Firmado, ya no se edita ni elimina.
- Endpoints: crear, listar paginado con filtros, detalle, editar, firma RRHH, eliminar, descargar firma.
- Nuevo filtro de archivos `signatureFilter` en `src/common/helpers/`.

**Fuera de alcance (para specs futuras):**

- Empleados de finca (BioTime) y registro de "leave" en la API de BioTime.
- Permisos de rango de fechas o de horas parciales.
- Estados explícitos (pendiente/aprobado/rechazado) y rechazo por RRHH.
- Adjuntos de respaldo (constancia médica, IGSS).
- Catálogo editable de tipos de permiso.
- Reemplazar firmas o cambiar trabajador/comodín de un permiso existente.
- Integrar permisos al reporte de marcajes (`POST /employee-transactions/report`) o al dashboard.
- Continuar la numeración del talonario de papel.
- Ruta `/files` para URLs firmadas del driver `local`.
- Migraciones de base de datos.

---

## Modelo de datos

### Nueva entidad `src/permissions/entities/permission.entity.ts`

```ts
export enum PermissionTypeEnum {
  sickness = 'enfermedad',
  personal = 'personal',
  igss = 'igss',
  bereavement = 'duelo',
  other = 'otro',
}

export enum SalaryStatusEnum {
  paid = 'con_goce',
  unpaid = 'sin_goce',
  unjustified = 'falta_injustificada',
}

@Entity()
@Index(['employee_pin', 'date'], { unique: true })
@Index(['substitute_pin', 'date'])
export class Permission {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column('int', { unique: true }) @Generated('increment') folio: number;

  @Column('date') date: string;                                 // 'YYYY-MM-DD'

  // Trabajador: FK lógica a pers_person.pin (MSSQL)
  @Column('text') employee_pin: string;
  @Column('text') employee_name: string;                        // snapshot "name last_name"
  @Column('text') department_name: string;                      // snapshot authDepartment.name
  @Column('text', { nullable: true }) position_name: string | null; // snapshot position.name

  // Comodín: FK lógica a pers_person.pin (MSSQL)
  @Column('text', { nullable: true }) substitute_pin: string | null;
  @Column('text', { nullable: true }) substitute_name: string | null;

  @Column({ type: 'enum', enum: PermissionTypeEnum }) type: PermissionTypeEnum;
  @Column('text') reason: string;                               // "Motivo de salida"
  @Column({ type: 'enum', enum: SalaryStatusEnum }) salary_status: SalaryStatusEnum;

  @Column('time') shift_start: string;                          // 'HH:mm'
  @Column('time') shift_end: string;                            // 'HH:mm'

  // Firmas: keys en el disco 'private' -> 'permissions/<id>/<firmante>.png'
  @Column('text') employee_signature_key: string;
  @Column('text', { nullable: true }) substitute_signature_key: string | null;
  @Column('text') supervisor_signature_key: string;
  @Column('text') floor_auditor_signature_key: string;
  @Column('text', { nullable: true }) hr_signature_key: string | null;

  @ManyToOne(() => User, { eager: true, nullable: true }) hr_signed_by: User | null;
  @Column('timestamptz', { nullable: true }) hr_signed_at: Date | null;

  @ManyToOne(() => User, { eager: true }) created_by: User;
  @ManyToOne(() => User, { eager: true, nullable: true }) updated_by: User | null;
  @CreateDateColumn() created_at: Date;
  @UpdateDateColumn() updated_at: Date;
}
```

- Trabajador y comodín apuntan a la misma tabla (`pers_person`), pero viven en otra base (MSSQL). No hay FK real: son dos columnas `pin` validadas en el service.
- `folio` es un `serial` de Postgres que arranca en 1, independiente del UUID.
- `date` se tipa como `string` (`YYYY-MM-DD`) para evitar corrimientos de zona horaria.
- Los snapshots (`*_name`) no se actualizan si el empleado cambia en ZKBioAccess.
- Un permiso es **válido** cuando `hr_signed_at` no es `null`. No hay columna de estado.

### Firmantes

```ts
export enum SignerEnum {
  employee = 'employee',
  substitute = 'substitute',
  supervisor = 'supervisor',
  floor_auditor = 'floor_auditor',
  hr = 'hr',
}
```

Usado en la key del archivo y en la ruta de descarga.

### DTOs en `src/permissions/dto/`

| DTO | Campos |
| --- | --- |
| `CreatePermissionDto` (multipart) | Obligatorios: `employee_pin`, `date` (`YYYY-MM-DD`), `type`, `reason` (no vacío), `salary_status`, `shift_start` y `shift_end` (`HH:mm`). Opcional: `substitute_pin`. Archivos (`FileFieldsInterceptor`): `employee_signature`, `supervisor_signature`, `floor_auditor_signature` obligatorios; `substitute_signature` obligatorio solo con `substitute_pin`. |
| `UpdatePermissionDto` (JSON) | Opcionales: `date`, `type`, `reason`, `salary_status`, `shift_start`, `shift_end`. Sin `employee_pin`, `substitute_pin` ni firmas. |
| `HrSignatureDto` (multipart) | Archivo `signature` obligatorio. |
| `PermissionQueryDto extends PaginationDto` | Opcionales: `employee_pin` (like), `employee_name` (like), `substitute_pin` (like), `folio`, `date` (filtro fecha de `Filters`), `type`, `salary_status`, `hr_signed` (boolean). |

- `hr_signed` no es columna: el service lo traduce a `hr_signed_at: Not(IsNull())` / `IsNull()` fuera de `Filters.buildWhere`.

### Respuesta (`interfaces/` + `resources/permission.resource.ts` + `resources/permission.response.ts`)

```ts
{
  id: string;
  folio: number;
  date: string;
  employee: { pin: string; name: string; department: string; position: string | null };
  substitute: { pin: string; name: string } | null;
  type: PermissionTypeEnum;
  reason: string;
  salary_status: SalaryStatusEnum;
  shift_start: string;
  shift_end: string;
  signatures: { employee: boolean; substitute: boolean; supervisor: boolean; floor_auditor: boolean; hr: boolean };
  is_valid: boolean;              // hr_signed_at !== null
  hr_signed_by: string | null;    // nombre del usuario
  hr_signed_at: Date | null;
  created_by: string;
  updated_by: string | null;
  created_at: Date;
  updated_at: Date;
}
```

- Las keys de las firmas no se exponen. Se descargan por `GET /permissions/:id/signatures/:signer`.

---

## Reglas de negocio

1. Lectura (`GET`) con `@Auth()` (cualquier usuario autenticado). Escritura (`POST`, `PATCH`, `DELETE`, firma RRHH) con `@Auth(ValidRoles.admin, ValidRoles.rrhh)`.
2. `employee_pin` debe existir en `pers_person` → si no, 404 (vía `EmployeesService`, cargando `authDepartment` y `position` para los snapshots).
3. `substitute_pin`, si viene, debe existir en `pers_person` → si no, 404.
4. `substitute_pin` igual a `employee_pin` → 400.
5. `date` acepta fechas pasadas y futuras.
6. Un solo permiso por `(employee_pin, date)` → duplicado 400 vía `DatabaseHelpers.handleExeptions` (código `23505`).
7. El comodín no puede tener su propio permiso (`employee_pin = substitute_pin`) en esa `date` → 400.
8. El trabajador no puede ser comodín de otro permiso (`substitute_pin = employee_pin`) en esa `date` → 400.
9. Las reglas 6–8 se revalidan en `PATCH` cuando cambia `date`.
10. `shift_start` y `shift_end` con formato `HH:mm`. Iguales → 400. `shift_end < shift_start` se acepta (turno que cruza medianoche).
11. Firmas: solo `image/png` → si no, 400 (`signatureFilter` llama al callback con `BadRequestException`). Mayor a 1 MB → 413 (`limits: { fileSize: 1024 * 1024 }`).
12. Crear: falta una firma obligatoria → 400. `substitute_signature` sin `substitute_pin` → 400. `substitute_pin` sin `substitute_signature` → 400.
13. Crear: se guarda el registro y luego las firmas en `permissions/<id>/<firmante>.png`. Si falla un `put`, se borran las firmas ya subidas y el registro, y se responde 500.
14. `POST /permissions/:id/hr-signature`: guarda `permissions/<id>/hr.png`, `hr_signed_by` (usuario de `@GetUser()`) y `hr_signed_at = now()`. Ya firmado → 400.
15. Permiso con firma RRHH: `PATCH` y `DELETE` → 400.
16. `PATCH` guarda `updated_by` con el usuario de `@GetUser()`. Enviar `employee_pin`, `substitute_pin` o archivos → 400 (propiedad no permitida).
17. `DELETE` elimina el registro (hard delete) y sus firmas. Un fallo al borrar archivos se registra con `Logger` y no revierte la eliminación.
18. `GET /permissions/:id/signatures/:signer` sirve el PNG con `serveFile` del disco `private` (`disposition: 'inline'`). `signer` fuera de `SignerEnum` → 400. Firma inexistente (comodín o RRHH sin firmar) → 404.
19. `id` inexistente en cualquier endpoint `/:id` → 404. `id` no UUID → 400 (`ParseUUIDPipe`).

---

## Endpoints

| Método | Ruta | Roles | Respuesta |
| --- | --- | --- | --- |
| `POST` | `/api/permissions` | admin, rrhh | Permiso creado (`is_valid = false`) |
| `GET` | `/api/permissions` | autenticado | Paginado (`data`, `total`, `totalPages`, `currentPage`), orden `date DESC, folio DESC` |
| `GET` | `/api/permissions/:id` | autenticado | Permiso |
| `GET` | `/api/permissions/:id/signatures/:signer` | autenticado | PNG (stream) |
| `PATCH` | `/api/permissions/:id` | admin, rrhh | Permiso actualizado |
| `POST` | `/api/permissions/:id/hr-signature` | admin, rrhh | Permiso firmado (`is_valid = true`) |
| `DELETE` | `/api/permissions/:id` | admin, rrhh | Mensaje de confirmación |

Todos los endpoints llevan decoradores Swagger (`@ApiTags('Permisos de empleados')`, `@ApiOperation`, `@ApiParam`, `@ApiConsumes('multipart/form-data')` donde aplique, respuestas 400/401/403/404/413) siguiendo el estilo de `tasks.controller.ts`.

---

## Plan de implementación

1. Crear `src/permissions/` (módulo, entidad con enums, controller y service vacíos). Importar `TypeOrmModule.forFeature([Permission])`, `AuthModule`, `CommonModule`, `EmployeesModule`. Registrar `PermissionsModule` en `app.module.ts`. Arranca en dev y crea la tabla `permission` con `folio` serial.
2. Crear interfaces, `PermissionResource` y `PermissionResponse`.
3. Crear `src/common/helpers/signature-filter.ts` (solo PNG, error 400).
4. Implementar en el service la carga de trabajador y comodín por `pin` con snapshots, y las validaciones de las reglas 2–4, 7, 8 y 10.
5. Implementar `POST /permissions` con `FileFieldsInterceptor` (4 campos), `@InjectDisk('private')`, límite 1 MB y rollback de la regla 13.
6. Implementar `GET /permissions` paginado (`Filters.buildWhere` con `like: ['employee_pin', 'employee_name', 'substitute_pin']`, `date: ['date']` + filtro `hr_signed`) y `GET /permissions/:id`.
7. Implementar `GET /permissions/:id/signatures/:signer` con `serveFile`.
8. Implementar `POST /permissions/:id/hr-signature`.
9. Implementar `PATCH /permissions/:id` (JSON) con bloqueo por firma RRHH y revalidación de la regla 9.
10. Implementar `DELETE /permissions/:id` con bloqueo por firma RRHH y borrado de firmas.
11. Documentar Swagger de todos los endpoints.

---

## Criterios de aceptación

- [ ] `POST /api/permissions` con datos válidos, sin comodín y con las 3 firmas obligatorias crea el permiso con `folio` numérico, `is_valid = false` y `substitute = null`.
- [ ] Dos permisos creados seguidos tienen `folio` consecutivo.
- [ ] `POST /api/permissions` devuelve `employee.name`, `employee.department` y `employee.position` tomados de ZKBioAccess.
- [ ] `POST /api/permissions` con `substitute_pin` y `substitute_signature` crea el permiso con `substitute.name` lleno y `signatures.substitute = true`.
- [ ] `POST /api/permissions` con `employee_pin` o `substitute_pin` inexistente devuelve 404.
- [ ] `POST /api/permissions` con `substitute_pin = employee_pin` devuelve 400.
- [ ] `POST /api/permissions` con `substitute_pin` sin `substitute_signature`, o viceversa, devuelve 400.
- [ ] `POST /api/permissions` sin `employee_signature`, `supervisor_signature` o `floor_auditor_signature` devuelve 400.
- [ ] `POST /api/permissions` con una firma JPG devuelve 400; con un PNG de más de 1 MB devuelve 413.
- [ ] Un segundo `POST /api/permissions` con el mismo `employee_pin` y `date` devuelve 400.
- [ ] `POST /api/permissions` con un comodín que tiene su propio permiso esa fecha devuelve 400.
- [ ] `POST /api/permissions` para un trabajador que es comodín de otro permiso esa fecha devuelve 400.
- [ ] `POST /api/permissions` con `shift_start = shift_end` devuelve 400; con `shift_start = 22:00` y `shift_end = 06:00` crea el permiso.
- [ ] `POST /api/permissions` con `salary_status` o `type` fuera del enum devuelve 400.
- [ ] `POST /api/permissions` con una `date` pasada crea el permiso.
- [ ] Las firmas quedan en `permissions/<id>/employee.png`, `supervisor.png`, `floor_auditor.png` (y `substitute.png` si aplica) del disco `private`.
- [ ] `GET /api/permissions/:id/signatures/supervisor` devuelve el PNG con `Content-Type: image/png`.
- [ ] `GET /api/permissions/:id/signatures/hr` antes de la firma RRHH devuelve 404; `signatures/foo` devuelve 400.
- [ ] `POST /api/permissions/:id/hr-signature` con un PNG deja `is_valid = true`, `hr_signed_by` con el usuario y `hr_signed_at` lleno.
- [ ] Repetir `POST /api/permissions/:id/hr-signature` devuelve 400.
- [ ] `PATCH` y `DELETE` sobre un permiso firmado por RRHH devuelven 400.
- [ ] `PATCH /api/permissions/:id` cambiando `reason` y `salary_status` en un permiso sin firma RRHH devuelve 200 y llena `updated_by`.
- [ ] `PATCH /api/permissions/:id` enviando `employee_pin` o `substitute_pin` devuelve 400.
- [ ] `PATCH /api/permissions/:id` cambiando `date` a una fecha con otro permiso del mismo trabajador devuelve 400.
- [ ] `DELETE /api/permissions/:id` sin firma RRHH elimina el registro y la carpeta `permissions/<id>/`.
- [ ] `GET /api/permissions?hr_signed=false` devuelve solo permisos sin firma RRHH.
- [ ] `GET /api/permissions?employee_pin=11617&date=2026-11-01,2026-11-30` devuelve solo los permisos de ese pin en ese rango.
- [ ] `GET /api/permissions` y `GET /api/permissions/:id` responden 200 a un usuario con rol solo `user`.
- [ ] `POST`, `PATCH`, `DELETE` y `POST /:id/hr-signature` responden 403 a un usuario con rol solo `user`.
- [ ] Cualquier endpoint `/:id` con un UUID inexistente devuelve 404.
- [ ] `yarn build` y `yarn lint` pasan sin errores.

---

## Decisiones

- **Sí:** digitalizar el formulario ODC-RH-09 completo. Se elimina el papel.
- **Sí:** solo empleados de planta (ZKBioAccess). Finca queda para otra spec.
- **Sí:** persistencia solo en Postgres. ZKBioAccess no maneja ausencias.
- **Sí:** trabajador y comodín como dos `pin` (FK lógica) a `pers_person` + snapshots de nombre. No hay FK real entre Postgres y MSSQL.
- **No:** guardar `pers_person.id`. El resto de la app identifica empleados por `pin`.
- **Sí:** comodín opcional. Una falta injustificada o un permiso sin reemplazo no lo tiene.
- **Sí:** comodín ≠ trabajador y sin permiso propio ese día; el trabajador tampoco puede ser comodín ese día.
- **Sí:** área y posición como snapshot del trabajador. No se escriben a mano.
- **Sí:** `folio` autoincremental desde 1, aparte del UUID.
- **No:** continuar la numeración del talonario.
- **Sí:** `salary_status` de 3 valores (`con_goce`/`sin_goce`/`falta_injustificada`). Reemplaza al booleano `paid` y evita combinaciones inválidas.
- **Sí:** mantener `type` (enum) + `reason` libre. El enum sirve para reportes; `reason` transcribe el "Motivo de salida".
- **Sí:** turno obligatorio e informativo. El permiso sigue siendo de un día.
- **Sí:** turnos que cruzan medianoche (`shift_end < shift_start`).
- **No:** permisos por horas.
- **Sí:** cinco firmas PNG de hasta 1 MB (trabajador, comodín, jefe, auditor, RRHH).
- **No:** guardar el nombre de jefe y auditor. Solo la imagen.
- **Sí:** firmas de trabajador, comodín, jefe y auditor al crear; RRHH en un endpoint aparte.
- **Sí:** sin columna de estado. La validez se deriva de `hr_signed_at`.
- **No:** estados pendiente/aprobado/rechazado ni rechazo por RRHH.
- **Sí:** RRHH firma una sola vez; admin también puede firmar.
- **Sí:** firmado por RRHH = inmutable (sin `PATCH` ni `DELETE`).
- **Sí:** firmas fijas. Para corregir firmas o cambiar trabajador/comodín se elimina y se recrea (solo antes de la firma RRHH).
- **No:** adjuntos de respaldo. Sin papel, no hay formulario que adjuntar.
- **Sí:** descarga de firmas por endpoint autenticado con `serveFile`. Funciona igual con driver `s3` y `local`.
- **No:** URLs firmadas. En `local` exigirían crear la ruta `/files`.
- **Sí:** lectura para cualquier usuario autenticado, escritura solo admin/rrhh.
- **Sí:** nombre del recurso `permissions`.
- **Sí:** hard delete. Solo aplica a permisos sin firma RRHH.
- **No:** integrar con el reporte de marcajes en esta spec.

---

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| "Permisos" puede confundirse con permisos de usuario/roles (`ValidRoles`). | Swagger usa el tag "Permisos de empleados" y la descripción aclara que es el control de ausencias. |
| No hay migraciones; `synchronize` solo corre con `APP_ENV=dev`. La tabla `permission` y la secuencia de `folio` no se crean en otros entornos. | Aplicar el SQL manualmente en entornos no-dev o crear migraciones en otra spec. |
| `folio` serial deja huecos si una creación falla después del `INSERT` (rollback de la regla 13). | Aceptado; el folio es identificador, no numeración contable. |
| El disco `private` nunca se ha usado; en `s3` requiere `S3_PRIVATE_BUCKET` configurado. | Verificar la variable antes de desplegar. En dev usar `STORAGE_DRIVER=local`. |
| Crear sube hasta 4 archivos; un fallo a medias deja archivos huérfanos. | Rollback de la regla 13; fallos al borrar se registran con `Logger`. |
| Las reglas 7 y 8 se validan con consultas previas, sin índice único que las respalde. Dos creaciones simultáneas podrían saltarlas. | Aceptado por bajo volumen. |
| Los snapshots quedan desactualizados si el empleado cambia de nombre, área o posición. | Aceptado: reflejan el momento del permiso, igual que el papel. |
| Un error en una firma obliga a eliminar y recrear el permiso, generando un `folio` nuevo. | Aceptado por decisión de firmas fijas. |

---

## Lo que **no** está en esta spec

- Empleados de finca e integración con BioTime.
- Rangos de fechas y permisos por horas.
- Estados explícitos y rechazo por RRHH.
- Adjuntos de respaldo.
- Catálogo editable de tipos.
- Reemplazo de firmas o cambio de trabajador/comodín.
- Cruce con reporte de marcajes y dashboard.
- Continuación del folio del talonario.
- Ruta `/files` para URLs firmadas.
- Migraciones de base de datos.

Cada uno, si llega, va en su propia spec.
