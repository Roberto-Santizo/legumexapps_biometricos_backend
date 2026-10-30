import { Auth } from '../auth/decorators/auth.decorator.js';
import { Body, Controller, Get, Post, Patch, Param, Delete, UseInterceptors, UploadedFile, BadRequestException, Query, ParseUUIDPipe } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ApiPaginatedResponse } from '../common/decorators/index.js';
import { CreateCreationTaskDto } from './dto/create-creation-task.dto.js';
import { CreateInactivationTaskDto } from './dto/create-inactivation-task.dto.js';
import { CreateMovementTaskDto } from './dto/create-movement-task.dto.js';
import { GetUser } from '../auth/decorators/get-user.decorator.js';
import { TaskQueryDto } from './dto/task-query.dto.js';
import { TaskResponse } from './resource/task.response.js';
import { TasksService } from './tasks.service.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';
import { User } from '../auth/entities/user.entity.js';
import { ValidRoles } from '../auth/interfaces/interfaces.js';
import { imageFilter } from '../common/helpers/image-filter.js';
import { xlxsFileFilter } from '../common/helpers/xlxs-file-filter.js';

const UNAUTHORIZED_DESCRIPTION = 'Token ausente o inválido ("Token not valid") o el usuario no está activo ("User is not active")';
const FORBIDDEN_DESCRIPTION = 'El usuario autenticado no tiene el rol admin o rrhh ("Unauthorized")';

@ApiTags('Tareas')
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) { }

  @Post('upload/:type')
  @Auth(ValidRoles.admin, ValidRoles.rrhh)
  @UseInterceptors(FileInterceptor('file', { fileFilter: xlxsFileFilter }))
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Programar tareas desde Excel',
    description: 'Lee la primera hoja del archivo Excel (desde la fila 2) y programa una tarea por fila, todas en un mismo lote y dentro de una transacción. Columnas esperadas según el tipo: '
      + 'creation (alta): posición, código, nombre, código de departamento, nivel de acceso, fecha programada; '
      + 'movement (movimiento): posición, código, código de departamento, nivel de acceso, fecha programada; '
      + 'inactivate (baja): código, fecha programada.',
  })
  @ApiParam({
    name: 'type',
    type: String,
    enum: ['creation', 'movement', 'inactivate'],
    description: 'Tipo de tareas a programar: creation (altas), movement (movimientos) o inactivate (bajas)',
    example: 'movement',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Archivo Excel (.xlsx) con las tareas a programar',
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Tareas programadas correctamente',
    schema: { type: 'string', example: 'Movimientos Programados Correctamente' },
  })
  @ApiBadRequestResponse({
    description: 'No se envió archivo o no es .xlsx ("Make sure that the file exists and its an xlxs"), tipo inválido ("El tipo <type> no es una acción válida"), fila incompleta ("Asegurese que el excel cumpla con el formato esperado") o ya existe una tarea pendiente del mismo tipo para el PIN',
  })
  @ApiUnauthorizedResponse({ description: UNAUTHORIZED_DESCRIPTION })
  @ApiForbiddenResponse({ description: FORBIDDEN_DESCRIPTION })
  @ApiNotFoundResponse({
    description: 'No se encontró la hoja de Excel, o no existe el departamento ("El departamento <deptCode> no existe"), el nivel de acceso ("El nivel de acceso <nombre> no existe") o el empleado ("El empleado con código <code> no existe")',
  })
  @ApiInternalServerErrorResponse({ description: 'Error al guardar las tareas en la base de datos' })
  create(@Param('type') type: string, @UploadedFile() file: any, @GetUser() user: User) {
    if (!file) throw new BadRequestException("Make sure that the file exists and its an xlxs");
    return this.tasksService.uploadFile(file, user, type);
  }

  @Post('creation')
  @Auth(ValidRoles.admin, ValidRoles.rrhh)
  @UseInterceptors(FileInterceptor('file', { fileFilter: imageFilter }))
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Programar alta',
    description: 'Crea una tarea de alta (`alta`, `pendiente`) dentro de una planificación. La foto es opcional: si se adjunta, se guarda o sobrescribe `<pin>.jpg`; si no existe al ejecutar la tarea, el error queda en `last_error`. '
      + '`scheduled_at` debe ser hoy o posterior y estar dentro de la semana de la planificación. La disponibilidad de la posición se valida al ejecutar.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Datos del nuevo empleado y foto opcional (jpg, jpeg, png o gif)',
    schema: {
      type: 'object',
      required: ['planification_id', 'pin', 'name', 'lastName', 'position_id', 'auth_dept_id', 'accLevelIds', 'scheduled_at'],
      properties: {
        planification_id: { type: 'string', format: 'uuid', example: '3f2b8c1e-6d4a-4b9e-9c1a-2e7f5d8a9b10' },
        pin: { type: 'string', example: '10045' },
        name: { type: 'string', example: 'Juan Carlos' },
        lastName: { type: 'string', example: 'Pérez López' },
        position_id: { type: 'string', example: '4028898594b7f9660194b7fb5d7a0600' },
        auth_dept_id: { type: 'string', example: '4028898594b7f9660194b7fb5d7a0300' },
        accLevelIds: { type: 'string', description: 'IDs separados por coma', example: '4028898594b7f9660194b7fb5d7a0430' },
        scheduled_at: { type: 'string', format: 'date', example: '2026-11-03' },
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiCreatedResponse({ description: 'Alta programada', type: TaskResponse })
  @ApiBadRequestResponse({
    description: 'Datos inválidos (validación del body o propiedades no permitidas), el PIN pertenece a un empleado activo, `scheduled_at` anterior a hoy o fuera de la semana de la planificación, sin niveles de acceso, o ya existe una tarea pendiente del mismo tipo para el PIN',
  })
  @ApiUnauthorizedResponse({ description: UNAUTHORIZED_DESCRIPTION })
  @ApiForbiddenResponse({ description: FORBIDDEN_DESCRIPTION })
  @ApiNotFoundResponse({ description: 'No existe la planificación, el departamento, la posición o alguno de los niveles de acceso' })
  createCreation(@Body() createCreationTaskDto: CreateCreationTaskDto, @UploadedFile() file: any, @GetUser() user: User) {
    return this.tasksService.createCreation(createCreationTaskDto, file, user);
  }

  @Post('movement')
  @Auth(ValidRoles.admin, ValidRoles.rrhh)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Programar movimiento',
    description: 'Crea una tarea de movimiento (`movimiento`, `pendiente`) dentro de una planificación, cambiando posición, departamento y niveles de acceso del empleado. `previous` guarda los datos actuales del empleado. '
      + '`scheduled_at` debe ser hoy o posterior y estar dentro de la semana de la planificación. La disponibilidad de la posición se valida al ejecutar.',
  })
  @ApiCreatedResponse({ description: 'Movimiento programado', type: TaskResponse })
  @ApiBadRequestResponse({
    description: 'Datos inválidos (validación del body o propiedades no permitidas), `scheduled_at` anterior a hoy o fuera de la semana de la planificación, sin niveles de acceso, o ya existe una tarea pendiente del mismo tipo para el empleado',
  })
  @ApiUnauthorizedResponse({ description: UNAUTHORIZED_DESCRIPTION })
  @ApiForbiddenResponse({ description: FORBIDDEN_DESCRIPTION })
  @ApiNotFoundResponse({ description: 'No existe la planificación, el empleado, el departamento, la posición o alguno de los niveles de acceso' })
  createMovement(@Body() createMovementTaskDto: CreateMovementTaskDto, @GetUser() user: User) {
    return this.tasksService.createMovement(createMovementTaskDto, user);
  }

  @Post('inactivate')
  @Auth(ValidRoles.admin, ValidRoles.rrhh)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Programar baja',
    description: 'Crea una tarea de baja (`baja`, `pendiente`) dentro de una planificación con payload `{ pin, leaveType: 1, leaveDate: scheduled_at }`. `scheduled_at` debe ser hoy o posterior y estar dentro de la semana de la planificación.',
  })
  @ApiCreatedResponse({ description: 'Baja programada', type: TaskResponse })
  @ApiBadRequestResponse({
    description: 'Datos inválidos (validación del body o propiedades no permitidas), `scheduled_at` anterior a hoy o fuera de la semana de la planificación, o ya existe una tarea pendiente del mismo tipo para el empleado',
  })
  @ApiUnauthorizedResponse({ description: UNAUTHORIZED_DESCRIPTION })
  @ApiForbiddenResponse({ description: FORBIDDEN_DESCRIPTION })
  @ApiNotFoundResponse({ description: 'No existe la planificación o el empleado' })
  createInactivation(@Body() createInactivationTaskDto: CreateInactivationTaskDto, @GetUser() user: User) {
    return this.tasksService.createInactivation(createInactivationTaskDto, user);
  }

  @Get()
  @Auth(ValidRoles.admin, ValidRoles.rrhh)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Listar tareas',
    description: 'Devuelve las tareas programadas paginadas, con filtros opcionales por PIN (búsqueda parcial) y fecha programada. La respuesta incluye `data`, `total`, `totalPages` y `currentPage`.',
  })
  @ApiPaginatedResponse(TaskResponse, 'Listado paginado de tareas')
  @ApiBadRequestResponse({ description: 'Parámetros de consulta inválidos o no permitidos' })
  @ApiUnauthorizedResponse({ description: UNAUTHORIZED_DESCRIPTION })
  @ApiForbiddenResponse({ description: FORBIDDEN_DESCRIPTION })
  findAll(@Query() taskQueryDto: TaskQueryDto) {
    return this.tasksService.findAll(taskQueryDto);
  }

  @Get(':id')
  @Auth(ValidRoles.admin, ValidRoles.rrhh)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener tarea',
    description: 'Devuelve una tarea programada por su ID.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    format: 'uuid',
    description: 'ID de la tarea (UUID)',
    example: '3f2b8c1e-6d4a-4b9e-9c1a-2e7f5d8a9b10',
  })
  @ApiOkResponse({ description: 'Tarea encontrada', type: TaskResponse })
  @ApiBadRequestResponse({ description: 'El ID no es un UUID válido' })
  @ApiUnauthorizedResponse({ description: UNAUTHORIZED_DESCRIPTION })
  @ApiForbiddenResponse({ description: FORBIDDEN_DESCRIPTION })
  @ApiNotFoundResponse({ description: 'La tarea con ID <id> no existe' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.tasksService.findOne(id);
  }

  @Patch(':id')
  @Auth(ValidRoles.admin, ValidRoles.rrhh)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Editar tarea',
    description: 'Edita una tarea en estado `pendiente`, incluido cambiarla de planificación. El payload se recalcula con los valores finales (enviados o actuales). '
      + 'Campos permitidos según tipo: alta (position_id, auth_dept_id, accLevelIds, name, lastName), movimiento (position_id, auth_dept_id, accLevelIds), baja (ninguno de payload). '
      + 'El `scheduled_at` final debe ser hoy o posterior y, si la tarea queda con planificación, estar dentro de su semana. Las tareas de Excel sin planificación no validan semana.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    format: 'uuid',
    description: 'ID de la tarea (UUID)',
    example: '3f2b8c1e-6d4a-4b9e-9c1a-2e7f5d8a9b10',
  })
  @ApiOkResponse({ description: 'Tarea actualizada', type: TaskResponse })
  @ApiBadRequestResponse({
    description: 'ID no es UUID, datos inválidos, la tarea no está pendiente, campos que no aplican al tipo ("Los campos <campos> no aplican a una tarea de tipo <tipo>"), `scheduled_at` anterior a hoy o fuera de la semana de la planificación, o sin posición/niveles de acceso',
  })
  @ApiUnauthorizedResponse({ description: UNAUTHORIZED_DESCRIPTION })
  @ApiForbiddenResponse({ description: FORBIDDEN_DESCRIPTION })
  @ApiNotFoundResponse({ description: 'No existe la tarea, la planificación, el empleado, el departamento, la posición o alguno de los niveles de acceso' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return this.tasksService.update(id, updateTaskDto);
  }


  @Delete(':id')
  @ApiOperation({
    summary: 'Eliminar tarea',
    description: 'Elimina una tarea programada por su ID.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    format: 'uuid',
    description: 'ID de la tarea (UUID)',
    example: '3f2b8c1e-6d4a-4b9e-9c1a-2e7f5d8a9b10',
  })
  @ApiOkResponse({
    description: 'Tarea eliminada correctamente',
    schema: { type: 'string', example: 'Tarea 3f2b8c1e-6d4a-4b9e-9c1a-2e7f5d8a9b10 eliminada correctamente' },
  })
  @ApiBadRequestResponse({ description: 'El ID no es un UUID válido' })
  @ApiNotFoundResponse({ description: 'La tarea con ID <id> no existe' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.tasksService.remove(id);
  }
}
