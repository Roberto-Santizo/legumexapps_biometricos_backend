# SPEC 01 — Planificación semanal de movimientos, altas y bajas

> **Estado:** Aprobado
> **Depende de:** —
> **Fecha:** 2026-10-30
> **Objetivo:** Permitir crear, editar y agrupar por semana ISO tareas individuales de movimiento, alta y baja de empleados, además de la carga por Excel existente.

---

## Por qué existe esta spec

Hoy las tareas (`Task`) solo se crean en lote desde Excel (`POST /tasks/upload/:type`).
RRHH necesita planificar uno a uno, seleccionando un empleado y cambiando su posición y departamento.
También necesita ver la planificación agrupada por semana.
La semana se modela como entidad propia (`Planification`) para poder listarla aunque esté vacía y extenderla más adelante.

---

## Alcance

**Dentro:**

- Nueva entidad `Planification` (semana ISO lunes–domingo) con módulo `src/planifications/`.
- Endpoints de planificación: crear, listar paginado con conteos, detalle con tareas, eliminar (solo si está vacía).
- Tres endpoints para crear tareas individuales dentro de una planificación:
  - `POST /tasks/movement` (JSON).
  - `POST /tasks/creation` (multipart, foto opcional).
  - `POST /tasks/inactivate` (JSON).
- `PATCH /tasks/:id` para editar tareas en estado `pendiente`, incluido cambiar de planificación.
- `Task` gana FK nullable `planification` y las columnas de origen Excel pasan a nullable.
- `PhotosService` gana un método para guardar o sobrescribir la foto `<pin>.jpg`.
- `planification_id` aparece en la respuesta de tareas.

**Fuera de alcance (para specs futuras):**

- Corregir el cron (`CronService.executeTasks`), que ejecuta todas las tareas pendientes sin filtrar por `scheduled_at`.
- Asignar planificación a las tareas cargadas por Excel (siguen con `planification = null`).
- Validar disponibilidad de la posición al crear tareas (sigue validándose al ejecutar).
- Estado o ciclo de vida de la planificación (abierta/cerrada/aprobada).
- Editar la foto desde `PATCH /tasks/:id` (se usa el módulo Photos).
- Corregir los bugs existentes del flujo Excel (ver Riesgos).

---

## Modelo de datos

### Nueva entidad `src/planifications/entities/planification.entity.ts`

```ts
@Entity()
@Index(['year', 'week'], { unique: true })
export class Planification {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column('int') year: number;          // año ISO
  @Column('int') week: number;          // semana ISO 1–53
  @Column('date') start_date: Date;     // lunes de la semana
  @Column('date') end_date: Date;       // domingo de la semana
  @OneToMany(() => Task, task => task.planification) tasks: Task[];
  @ManyToOne(() => User, { eager: true }) created_by: User;
  @CreateDateColumn() created_at: Date;
  @UpdateDateColumn() updated_at: Date;
}
```

- `start_date` y `end_date` se calculan en el servidor con `date-fns` (`startOfISOWeek` / `endOfISOWeek` sobre `setISOWeek`), zona `America/Guatemala`.
- El body de creación solo recibe `year` y `week`.

### Cambios en `src/tasks/entities/task.entity.ts`

```ts
@ManyToOne(() => Planification, p => p.tasks, { nullable: true, onDelete: 'RESTRICT' })
@JoinColumn({ name: 'planification_id' })
planification: Planification | null;

@Column('uuid', { nullable: true }) batch_id: string | null;
@Column('text', { nullable: true }) source_file: string | null;
@Column('text', { nullable: true }) source_row: string | null;
```

- El índice único existente `(pin, type) WHERE status = 'pendiente'` se mantiene.
- Payloads (`MovementPayload`, `CreationPayload`, `InactivatePayload`) no cambian de forma.

### DTOs nuevos en `src/tasks/dto/`

| DTO | Campos |
| --- | --- |
| `CreateMovementTaskDto` | `planification_id` (uuid), `employee_id`, `position_id`, `auth_dept_id`, `accLevelIds`, `scheduled_at` — todos obligatorios |
| `CreateCreationTaskDto` | `planification_id`, `pin`, `name`, `lastName`, `position_id`, `auth_dept_id`, `accLevelIds`, `scheduled_at` + `file` opcional (multipart) |
| `CreateInactivationTaskDto` | `planification_id`, `employee_id`, `scheduled_at` |
| `UpdateTaskDto` | Opcionales: `planification_id`, `scheduled_at`, `position_id`, `auth_dept_id`, `accLevelIds`, `name`, `lastName` |

- `UpdateTaskDto` reemplaza al actual (`PartialType(CreateTaskDto)` vacío). `CreateTaskDto` vacío se elimina.
- `pin` y `employee_id` no se editan.
- Campos de `UpdateTaskDto` que no apliquen al tipo de la tarea → 400 (p. ej. `name` en un movimiento, cualquier campo de payload en una baja).

### DTOs en `src/planifications/dto/`

- `CreatePlanificationDto`: `year` (int ≥ 2000), `week` (int 1–53, validado contra el año ISO).
- `PlanificationQueryDto extends PaginationDto`: filtro opcional `year`.

---

## Reglas de negocio

1. Todos los endpoints nuevos usan `@Auth(ValidRoles.admin, ValidRoles.rrhh)`.
2. `scheduled_at` debe ser `>=` hoy (`America/Guatemala`) → si no, 400.
3. `scheduled_at` debe caer entre `start_date` y `end_date` de la planificación indicada → si no, 400.
4. `planification_id` inexistente → 404.
5. **Movimiento:** empleado (`employee_id`), departamento (`auth_dept_id`), posición (`position_id`) y cada id de `accLevelIds` deben existir → si no, 404. El payload guarda `pin`, `deptCode`, `position` (code), `position_id`, `accLevelIds`, `name`, `lastName` del empleado. `previous` se llena con `formatEmployeeEntity(employee)`.
6. **Alta:** `pin` que ya es empleado activo (`pers_person`) → 400. Departamento, posición y niveles de acceso deben existir → 404. Si se adjunta foto, se guarda/sobrescribe `<pin>.jpg` y se crea el registro `Photo` si no existe. Si no se adjunta foto, se permite crear aunque no exista (fallará en el cron con `last_error`).
7. **Baja:** el empleado debe existir → 404. Payload: `{ pin, leaveType: 1, leaveDate: scheduled_at }`.
8. Duplicado de tarea pendiente `(pin, type)` → 400 vía `DatabaseHelpers.handleExeptions` (código `23505`).
9. Solo la posición se valida por existencia; su disponibilidad se valida al ejecutar.
10. **PATCH:** solo si `status = 'pendiente'` → si no, 400. Si cambia `planification_id`, el `scheduled_at` final (nuevo o actual) debe caer en la semana nueva. Las reglas 2–5 aplican sobre el resultado final. El payload se recalcula con los valores finales.
11. **DELETE planificación:** solo si no tiene tareas → si no, 400.
12. Crear planificación con `(year, week)` existente → 400.

---

## Endpoints

| Método | Ruta | Respuesta |
| --- | --- | --- |
| `POST` | `/api/planifications` | Planificación creada |
| `GET` | `/api/planifications` | Paginado: `data[]` con `id, year, week, start_date, end_date, created_by, counts` |
| `GET` | `/api/planifications/:id` | Planificación + `tasks[]` (formato `TaskResource`) |
| `DELETE` | `/api/planifications/:id` | Mensaje de confirmación |
| `POST` | `/api/tasks/movement` | Tarea creada (`TaskResource`) |
| `POST` | `/api/tasks/creation` | Tarea creada (`TaskResource`) |
| `POST` | `/api/tasks/inactivate` | Tarea creada (`TaskResource`) |
| `PATCH` | `/api/tasks/:id` | Tarea actualizada (`TaskResource`) |

`counts` en el listado:

```ts
{
  total: number;
  by_type: { movimiento: number; alta: number; baja: number };
  by_status: { pendiente: number; completada: number; fallida: number };
}
```

Todos los endpoints llevan decoradores Swagger (`@ApiOperation`, `@ApiParam`, respuestas 400/401/403/404) siguiendo el estilo de `tasks.controller.ts`.

---

## Plan de implementación

1. Crear `src/planifications/` (módulo, entidad, controller y service vacíos) y registrar `PlanificationsModule` en `app.module.ts`. Arranca en dev y crea la tabla `planification`.
2. Implementar `POST /planifications` con cálculo de `start_date`/`end_date` y unicidad `(year, week)`. Prueba manual: crear 2026-W45 → `start_date = 2026-11-02`, `end_date = 2026-11-08`.
3. Implementar `GET /planifications/:id` (sin tareas aún) y `DELETE /planifications/:id`.
4. Modificar `Task`: FK `planification` nullable y columnas Excel nullable. Agregar `planification_id` a `TaskResource`/`TaskResponse`. Verificar que `POST /tasks/upload/:type` sigue funcionando.
5. Agregar en `TasksService` helpers de validación comunes: fecha `>=` hoy, fecha dentro de la semana, existencia de planificación. Exportar `PlanificationsService` (o el repositorio) desde `PlanificationsModule` e importarlo en `TasksModule`.
6. Implementar `POST /tasks/inactivate` con `CreateInactivationTaskDto`.
7. Implementar `POST /tasks/movement` con `CreateMovementTaskDto`.
8. Agregar a `PhotosService` el método `upsert(code, file, user)` que sobrescribe `<code>.jpg` y crea el registro `Photo` si no existe.
9. Implementar `POST /tasks/creation` (multipart, `imageFilter`) con `CreateCreationTaskDto` y foto opcional vía `PhotosService.upsert`. `PhotosModule` ya está importado en `TasksModule`.
10. Reemplazar `UpdateTaskDto` y eliminar `CreateTaskDto`. Implementar `PATCH /tasks/:id` con recálculo de payload por tipo.
11. Completar `GET /planifications/:id` con `tasks[]` y `GET /planifications` paginado con `counts` (query builder agrupando por `type` y `status`).
12. Documentar Swagger de todos los endpoints nuevos.

---

## Criterios de aceptación

- [ ] `POST /api/planifications {year: 2026, week: 45}` devuelve `start_date = 2026-11-02` y `end_date = 2026-11-08`.
- [ ] Repetir `POST /api/planifications {year: 2026, week: 45}` devuelve 400.
- [ ] `POST /api/planifications {year: 2026, week: 54}` devuelve 400.
- [ ] `POST /api/tasks/movement` con datos válidos crea una tarea `movimiento` `pendiente` con `planification_id`, `payload.deptCode`, `payload.position_id` y `previous` llenos.
- [ ] `POST /api/tasks/movement` con `scheduled_at` fuera de la semana de la planificación devuelve 400.
- [ ] `POST /api/tasks/movement` con `scheduled_at` anterior a hoy devuelve 400.
- [ ] `POST /api/tasks/movement` con `employee_id`, `auth_dept_id`, `position_id` o un `accLevelIds` inexistente devuelve 404.
- [ ] Un segundo `POST /api/tasks/movement` para el mismo empleado con otro pendiente devuelve 400.
- [ ] `POST /api/tasks/creation` con un `pin` de empleado activo devuelve 400.
- [ ] `POST /api/tasks/creation` con foto guarda `<pin>.jpg`; repetirlo para el mismo pin (tras borrar la tarea) sobrescribe el archivo sin error.
- [ ] `POST /api/tasks/creation` sin foto crea la tarea.
- [ ] `POST /api/tasks/inactivate` crea una tarea `baja` con `payload = { pin, leaveType: 1, leaveDate }`.
- [ ] `PATCH /api/tasks/:id` sobre una tarea `completada` o `fallida` devuelve 400.
- [ ] `PATCH /api/tasks/:id` cambiando `planification_id` a otra semana sin ajustar `scheduled_at` devuelve 400; ajustándolo dentro de la nueva semana devuelve 200 y la tarea aparece en el detalle de la nueva planificación.
- [ ] `PATCH /api/tasks/:id` enviando `name` a una tarea de movimiento devuelve 400.
- [ ] `PATCH /api/tasks/:id` cambiando `position_id` en un movimiento actualiza `payload.position` y `payload.position_id`.
- [ ] `GET /api/planifications/:id` devuelve la semana y sus tareas.
- [ ] `GET /api/planifications` devuelve `counts.total`, `counts.by_type` y `counts.by_status` correctos para una semana con tareas mixtas.
- [ ] `DELETE /api/planifications/:id` con tareas devuelve 400; vacía devuelve 200.
- [ ] `POST /api/tasks/upload/movement` sigue creando tareas con `planification_id = null`.
- [ ] Todos los endpoints nuevos devuelven 403 a un usuario con rol solo `user`.
- [ ] `yarn build` y `yarn lint` pasan sin errores.

---

## Decisiones

- **Sí:** entidad `Planification` propia. Permite semanas vacías, conteos y futuro ciclo de vida.
- **No:** agrupación virtual por `scheduled_at`. No permite semanas sin tareas.
- **Sí:** semana ISO (lunes–domingo), única por `(year, week)`.
- **Sí:** la planificación se crea explícitamente y la tarea se crea dentro de ella. Control explícito de RRHH.
- **No:** get-or-create automático de la planificación al crear tareas.
- **Sí:** tres endpoints separados por tipo. DTOs simples y validación clara por tipo.
- **Sí:** movimiento con posición, departamento y nivel de acceso obligatorios. Mismo contrato que el Excel.
- **No:** campos opcionales en movimiento que hereden valores actuales.
- **Sí:** identificadores de entidad (`employee_id`, `auth_dept_id`, `position_id`). Es lo que el front selecciona; el servicio resuelve `pin`/`deptCode`.
- **No:** asignar planificación a tareas Excel. El flujo Excel queda igual; FK nullable.
- **Sí:** `PATCH` solo en `pendiente`, permitiendo cambiar de planificación.
- **Sí:** `scheduled_at >= hoy` en tareas manuales.
- **Sí:** solo validar existencia de la posición. Disponibilidad se valida al ejecutar, igual que el Excel.
- **No:** validar posición libre ni otra tarea pendiente a la misma posición.
- **Sí:** foto opcional en alta, sobrescribiendo `<pin>.jpg` si existe.
- **Sí:** permitir alta sin foto aunque no exista; el fallo se registra en `last_error` al ejecutar.
- **Sí:** alta con `pin` de empleado activo → 400. Para un activo se usa movimiento.
- **Sí:** eliminar planificación solo si está vacía (`onDelete: 'RESTRICT'`).
- **No:** corregir el filtro de fecha del cron en esta spec. Se decidió dejarlo para otra spec.

---

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| El cron ejecuta todas las pendientes sin mirar `scheduled_at`: una tarea planificada para semanas futuras se ejecuta a las 5:00 del día siguiente. | Fuera de alcance por decisión. Debe resolverse en una spec propia antes de usar la planificación en producción. |
| No hay migraciones; `synchronize` solo corre con `APP_ENV=dev`. La tabla `planification` y los cambios en `task` no se crean en otros entornos. | Aplicar el SQL manualmente en entornos no-dev o crear migraciones en otra spec. |
| Volver nullable `batch_id`/`source_file`/`source_row` con `synchronize` puede alterar columnas con datos existentes. | Solo se quita `NOT NULL`; no se pierden datos. Verificar en dev antes. |
| Alta sin foto falla en el cron (`PhotosService.getBuffer` lanza error). | Decisión aceptada; el error queda en `last_error`. |
| `formatEmployeeEntity` guarda `last_name` en `previous.position`, y `createTaskCreation` (Excel) pasa `position` como `lastName`. | Bugs existentes del flujo Excel, fuera de alcance. Los movimientos manuales heredan el bug de `previous.position` al reutilizar `formatEmployeeEntity`. |
| Dos tareas pendientes (de distintos empleados) pueden apuntar a la misma posición. | Decisión aceptada; la segunda falla al ejecutar. |

---

## Lo que **no** está en esta spec

- Corrección del cron para respetar `scheduled_at`.
- Planificación para tareas cargadas por Excel.
- Validación de disponibilidad de posición al planificar.
- Estados de la planificación (cerrada/aprobada).
- Edición de foto desde `PATCH /tasks/:id`.
- Corrección de bugs existentes en helpers del flujo Excel.
- Migraciones de base de datos.

Cada uno, si llega, va en su propia spec.
