---
name: documentation
description: Documenta con OpenAPI (@nestjs/swagger) todos los endpoints de un módulo NestJS. Uso exclusivo vía /documentation [module_name].
argument-hint: "[module_name]"
disable-model-invocation: true
---

# /documentation

Documenta con OpenAPI todos los endpoints del módulo `$ARGUMENTS`.

## 0. Validar argumento

- `$ARGUMENTS` debe ser exactamente un nombre de módulo (ej. `users`). Si está vacío o trae más de una palabra, detente y responde: `Uso: /documentation [module_name]`.
- El módulo debe existir como `src/$ARGUMENTS/` con un `*.module.ts` y al menos un `*.controller.ts`. Si no existe, lista las carpetas de `src/` que sí tengan controller y detente.

## 1. Preparar Swagger (solo si falta)

1. Si `@nestjs/swagger` no está en `package.json` → `yarn add @nestjs/swagger`.
2. Si `src/main.ts` no tiene `SwaggerModule`, agrégalo después de `useGlobalPipes` y antes de `app.listen`:

   ```ts
   import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
   // ...
   const config = new DocumentBuilder()
     .setTitle('Legumex Biométricos API')
     .setDescription('Documentación de la API de biométricos')
     .setVersion('1.0')
     .build();
   const document = SwaggerModule.createDocument(app, config);
   SwaggerModule.setup('api/docs', app, document);
   ```

   - No toques el `setGlobalPrefix`, el `ValidationPipe` ni el `await bootstrap()`.
3. No habilites el CLI plugin de swagger en `nest-cli.json`: la documentación es explícita con decoradores.

## 2. Leer el módulo completo antes de editar

Lee todo: controller(s), service(s) (incluye `services/`), `dto/`, `entities/` y los DTOs compartidos de `src/common/` que el controller use (ej. `PaginationDto`). Para cada endpoint determina:

- Método HTTP + ruta final (`/api/<prefijo-controller>/<ruta>`).
- Params (`@Param`, y su pipe, ej. `ParseIntPipe` → `type: Number`), query (`@Query`), body (`@Body`).
- Qué devuelve el service (entidad, arreglo, objeto, void).
- Qué excepciones puede lanzar (`NotFoundException`, `BadRequestException`, `_handleDbExceptions` → 400 por `23505`, 500 genérico). Además, todo endpoint con body o query DTO puede devolver **400** por el `ValidationPipe` (`whitelist` + `forbidNonWhitelisted`).

## 3. Documentar

Todos los textos (`summary`, `description`, ejemplos de mensajes) **en español**. Imports relativos con extensión `.js` (proyecto ESM). Respeta estilo existente del archivo (comillas, indentación).

### Controller

- `@ApiTags('<Módulo>')` en la clase.
- Por endpoint:
  - `@ApiOperation({ summary, description? })`.
  - `@ApiParam({ name, type, description, example })` por cada path param.
  - Query DTOs: no uses `@ApiQuery` si las propiedades del DTO ya tienen `@ApiPropertyOptional` (Swagger las infiere).
  - `@ApiBody` solo si el tipo del body no se infiere (normalmente no hace falta).
  - Respuesta de éxito con el decorador específico: `@ApiCreatedResponse` (POST), `@ApiOkResponse` (GET/PATCH/PUT/DELETE con body), `@ApiNoContentResponse` (204). Usa `type: Entity` o `type: [Entity]` para arreglos.
  - Respuestas de error reales del endpoint: `@ApiBadRequestResponse`, `@ApiNotFoundResponse`, etc., con `description` que explique cuándo ocurre (usa el mensaje real del service como referencia).
- No cambies firmas, rutas, pipes ni lógica.

### DTOs

- Cada propiedad con class-validator recibe `@ApiProperty` (o `@ApiPropertyOptional` si tiene `@IsOptional`), reflejando las restricciones: `minLength`/`maxLength`, `minimum`/`maximum`, `format: 'email'`, `enum`, `type`, `example`, `description`.
- DTOs de update: cambia `PartialType` (y `OmitType`/`PickType`/`IntersectionType`) para que se importe desde `@nestjs/swagger` en vez de `@nestjs/mapped-types`; si no, el schema del update queda vacío.
- Propiedades comentadas: ignóralas.

### Entities (como schema de respuesta)

- `@ApiProperty` en cada columna que se devuelve al cliente, con `example` y `description`.
- Si el service devuelve un campo sensible (ej. `password`), **no** lo documentes; no cambies el comportamiento.

## 4. Verificar

1. `yarn build` — debe compilar sin errores.
2. `yarn lint` — sin errores nuevos.
3. Si fallan, corrige y repite. No uses `any` ni desactives reglas para pasar.

## 5. Mensaje final

Responde **únicamente** con este mensaje (sin tablas, listas de archivos ni observaciones). `<PORT>` = valor de `PORT` en `.env`, o `3000` si no existe:

```
✅ Módulo <module_name> documentado correctamente.
📄 Documentación: http://localhost:<PORT>/api/docs
```

Si algún paso falla y no se puede resolver, responde solo con el error en una línea en vez del mensaje de éxito.
