import { Auth } from '../auth/decorators/auth.decorator.js';
import { Controller, Get, Post, Param, Delete, UseInterceptors, UploadedFile, BadRequestException, Query, ParseUUIDPipe } from '@nestjs/common';
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
import { GetUser } from '../auth/decorators/get-user.decorator.js';
import { TaskQueryDto } from './dto/task-query.dto.js';
import { TaskResponse } from './resource/task.response.js';
import { TasksService } from './tasks.service.js';
import { User } from '../auth/entities/user.entity.js';
import { ValidRoles } from '../auth/interfaces/interfaces.js';
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
