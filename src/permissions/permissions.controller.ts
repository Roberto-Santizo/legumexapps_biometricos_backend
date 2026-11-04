import { Body, Controller, Delete, Get, Param, ParseEnumPipe, ParseUUIDPipe, Patch, Post, Query, Req, Res, UploadedFile, UploadedFiles, UseInterceptors } from '@nestjs/common';
import type { Request, Response } from 'express';
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
  ApiPayloadTooLargeResponse,
  ApiProduces,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ApiPaginatedResponse } from '../common/decorators/index.js';
import { Auth } from '../auth/decorators/auth.decorator.js';
import { CreatePermissionDto, CreatePermissionMultipartDto } from './dto/create-permission.dto.js';
import { FileFieldsInterceptor, FileInterceptor, NoFilesInterceptor } from '@nestjs/platform-express';
import { GetUser } from '../auth/decorators/get-user.decorator.js';
import { HrSignatureDto } from './dto/hr-signature.dto.js';
import { type PermissionSignatureFiles } from './interfaces/index.js';
import { PermissionQueryDto } from './dto/permission-query.dto.js';
import { PermissionResponse } from './resources/permission.response.js';
import { PermissionsService } from './permissions.service.js';
import { SignerEnum } from './entities/permission.entity.js';
import { UpdatePermissionDto } from './dto/update-permission.dto.js';
import { User } from '../auth/entities/user.entity.js';
import { ValidRoles } from '../auth/interfaces/interfaces.js';
import { signatureFilter } from '../common/helpers/signature-filter.js';

const SIGNATURE_LIMITS = { fileSize: 1024 * 1024 };

const UNAUTHORIZED_DESCRIPTION = 'Token ausente o inválido ("Token not valid") o el usuario no está activo ("User is not active")';
const FORBIDDEN_DESCRIPTION = 'El usuario autenticado no tiene el rol admin o rrhh ("Unauthorized")';
const PAYLOAD_TOO_LARGE_DESCRIPTION = 'Una firma supera 1 MB ("File too large")';
const ID_PARAM = { name: 'id', type: String, format: 'uuid', description: 'ID del permiso (UUID)', example: '3f2b8c1e-6d4a-4b9e-9c1a-2e7f5d8a9b10' };
const NOT_FOUND_DESCRIPTION = 'El permiso no existe ("El permiso con ID <id> no existe")';
const HR_SIGNED_DESCRIPTION = 'el permiso ya tiene la firma de RRHH ("El permiso con ID <id> ya tiene la firma de RRHH")';

@ApiTags('Permisos de empleados')
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) { }

  @Post()
  @Auth(ValidRoles.admin, ValidRoles.rrhh)
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'employee_signature', maxCount: 1 },
    { name: 'substitute_signature', maxCount: 1 },
    { name: 'supervisor_signature', maxCount: 1 },
    { name: 'floor_auditor_signature', maxCount: 1 },
  ], { fileFilter: signatureFilter, limits: SIGNATURE_LIMITS }))
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Crear permiso (control de ausencias)',
    description: 'Digitaliza el formulario "Control de Ausencias" (ODC-RH-09): registra un permiso de un día para un empleado de planta (ZKBioAccess). '
      + 'Nombre, área y posición del trabajador se toman de ZKBioAccess como snapshot. '
      + 'Requiere las firmas PNG del trabajador, jefe/supervisor de línea y auditor de piso; la del comodín solo si se envía `substitute_pin`. '
      + 'El permiso queda sin validar (`is_valid = false`) hasta la firma de RRHH. No confundir con los roles de usuario.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreatePermissionMultipartDto })
  @ApiCreatedResponse({ description: 'Permiso creado', type: PermissionResponse })
  @ApiBadRequestResponse({
    description: 'Datos inválidos (formato de fecha/turno, enum fuera de rango, propiedad no permitida), firma que no es PNG, '
      + 'falta una firma obligatoria, `substitute_pin` sin `substitute_signature` o viceversa, comodín igual al trabajador, '
      + 'inicio y fin de turno iguales, permiso duplicado para el trabajador en esa fecha, '
      + 'el comodín tiene su propio permiso esa fecha o el trabajador es comodín de otro permiso esa fecha',
  })
  @ApiUnauthorizedResponse({ description: UNAUTHORIZED_DESCRIPTION })
  @ApiForbiddenResponse({ description: FORBIDDEN_DESCRIPTION })
  @ApiNotFoundResponse({ description: 'El trabajador o el comodín no existe en ZKBioAccess ("El usuario con código <pin> no existe")' })
  @ApiPayloadTooLargeResponse({ description: PAYLOAD_TOO_LARGE_DESCRIPTION })
  @ApiInternalServerErrorResponse({ description: 'Error al guardar las firmas; se revierte el registro ("Hubo un error al guardar las firmas del permiso")' })
  create(
    @Body() createPermissionDto: CreatePermissionDto,
    @UploadedFiles() files: PermissionSignatureFiles,
    @GetUser() user: User,
  ) {
    return this.permissionsService.create(createPermissionDto, files ?? {}, user);
  }

  @Post(':id/hr-signature')
  @Auth(ValidRoles.admin, ValidRoles.rrhh)
  @UseInterceptors(FileInterceptor('signature', { fileFilter: signatureFilter, limits: SIGNATURE_LIMITS }))
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Firmar permiso por RRHH (Vo.Bo.)',
    description: 'Registra la firma PNG de Recursos Humanos, el usuario que firma y la fecha. Solo se puede firmar una vez; '
      + 'desde ese momento el permiso es válido (`is_valid = true`) y ya no se puede editar ni eliminar.',
  })
  @ApiParam(ID_PARAM)
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: HrSignatureDto })
  @ApiCreatedResponse({ description: 'Permiso firmado por RRHH', type: PermissionResponse })
  @ApiBadRequestResponse({ description: `El ID no es un UUID válido, no se envió la firma, la firma no es PNG o ${HR_SIGNED_DESCRIPTION}` })
  @ApiUnauthorizedResponse({ description: UNAUTHORIZED_DESCRIPTION })
  @ApiForbiddenResponse({ description: FORBIDDEN_DESCRIPTION })
  @ApiNotFoundResponse({ description: NOT_FOUND_DESCRIPTION })
  @ApiPayloadTooLargeResponse({ description: PAYLOAD_TOO_LARGE_DESCRIPTION })
  @ApiInternalServerErrorResponse({ description: 'Error al guardar la firma ("Hubo un error al guardar la firma de RRHH")' })
  signByHr(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File | undefined,
    @GetUser() user: User,
  ) {
    return this.permissionsService.signByHr(id, file, user);
  }

  // NoFilesInterceptor: enviar archivos devuelve 400 (regla 16)
  @Patch(':id')
  @Auth(ValidRoles.admin, ValidRoles.rrhh)
  @UseInterceptors(NoFilesInterceptor())
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Editar permiso',
    description: 'Edita fecha, tipo, motivo, estado de salario y turno de un permiso sin firma de RRHH. '
      + 'No permite cambiar trabajador, comodín ni firmas: para eso se elimina y se recrea. Al cambiar la fecha se revalidan los conflictos.',
  })
  @ApiParam(ID_PARAM)
  @ApiOkResponse({ description: 'Permiso actualizado', type: PermissionResponse })
  @ApiBadRequestResponse({
    description: `El ID no es un UUID válido, datos inválidos, se envió \`employee_pin\`, \`substitute_pin\` o archivos, ${HR_SIGNED_DESCRIPTION}, `
      + 'inicio y fin de turno iguales, o la nueva fecha choca con otro permiso del trabajador o del comodín',
  })
  @ApiUnauthorizedResponse({ description: UNAUTHORIZED_DESCRIPTION })
  @ApiForbiddenResponse({ description: FORBIDDEN_DESCRIPTION })
  @ApiNotFoundResponse({ description: NOT_FOUND_DESCRIPTION })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
    @GetUser() user: User,
  ) {
    return this.permissionsService.update(id, updatePermissionDto, user);
  }

  @Delete(':id')
  @Auth(ValidRoles.admin, ValidRoles.rrhh)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Eliminar permiso',
    description: 'Elimina definitivamente un permiso sin firma de RRHH y sus firmas. Un fallo al borrar las firmas se registra en logs y no revierte la eliminación.',
  })
  @ApiParam(ID_PARAM)
  @ApiOkResponse({ description: 'Permiso eliminado', schema: { type: 'string', example: 'Permiso con folio 12 eliminado correctamente' } })
  @ApiBadRequestResponse({ description: `El ID no es un UUID válido o ${HR_SIGNED_DESCRIPTION}` })
  @ApiUnauthorizedResponse({ description: UNAUTHORIZED_DESCRIPTION })
  @ApiForbiddenResponse({ description: FORBIDDEN_DESCRIPTION })
  @ApiNotFoundResponse({ description: NOT_FOUND_DESCRIPTION })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.permissionsService.remove(id);
  }

  @Get()
  @Auth()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Listar permisos',
    description: 'Devuelve los permisos paginados con `limit`/`offset`, ordenados por fecha y folio descendente. '
      + 'Filtros: PIN y nombre del trabajador y PIN del comodín (búsqueda parcial), folio, fecha (`YYYY-MM-DD` o rango `desde,hasta`), tipo, estado de salario '
      + 'y `hr_signed` (con o sin firma de RRHH). Los usuarios sin rol admin o rrhh solo ven los permisos que crearon. '
      + 'La respuesta incluye `data`, `total`, `totalPages` y `currentPage`.',
  })
  @ApiPaginatedResponse(PermissionResponse, 'Listado paginado de permisos')
  @ApiBadRequestResponse({ description: 'Parámetros de consulta inválidos o no permitidos, o fecha inválida ("Fecha inválida en \'date\': <valor>")' })
  @ApiUnauthorizedResponse({ description: UNAUTHORIZED_DESCRIPTION })
  findAll(@Query() permissionQueryDto: PermissionQueryDto, @GetUser() user: User) {
    return this.permissionsService.findAll(permissionQueryDto, user);
  }

  @Get(':id')
  @Auth()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener permiso', description: 'Devuelve el detalle de un permiso. Las firmas se indican como booleanos y se descargan por `/permissions/:id/signatures/:signer`. '
      + 'Los usuarios sin rol admin o rrhh solo pueden consultar los permisos que crearon.' })
  @ApiParam(ID_PARAM)
  @ApiOkResponse({ description: 'Permiso encontrado', type: PermissionResponse })
  @ApiBadRequestResponse({ description: 'El ID no es un UUID válido ("Validation failed (uuid is expected)")' })
  @ApiUnauthorizedResponse({ description: UNAUTHORIZED_DESCRIPTION })
  @ApiNotFoundResponse({ description: `${NOT_FOUND_DESCRIPTION} o no fue creado por el usuario (si no tiene rol admin o rrhh)` })
  findOne(@Param('id', ParseUUIDPipe) id: string, @GetUser() user: User) {
    return this.permissionsService.findOne(id, user);
  }

  @Get(':id/signatures/:signer')
  @Auth()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Descargar firma', description: 'Devuelve la imagen PNG de una firma del permiso (inline). Los usuarios sin rol admin o rrhh solo acceden a permisos que crearon.' })
  @ApiParam(ID_PARAM)
  @ApiParam({ name: 'signer', enum: SignerEnum, description: 'Firmante', example: SignerEnum.supervisor })
  @ApiProduces('image/png')
  @ApiOkResponse({ description: 'Imagen PNG de la firma', schema: { type: 'string', format: 'binary' } })
  @ApiBadRequestResponse({ description: 'El ID no es un UUID válido o el firmante no es válido' })
  @ApiUnauthorizedResponse({ description: UNAUTHORIZED_DESCRIPTION })
  @ApiNotFoundResponse({ description: 'El permiso no existe, no fue creado por el usuario (si no tiene rol admin o rrhh) o no tiene esa firma (comodín ausente o RRHH sin firmar) ("El permiso con ID <id> no tiene firma de <signer>")' })
  serveSignature(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('signer', new ParseEnumPipe(SignerEnum)) signer: SignerEnum,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @GetUser() user: User,
  ) {
    return this.permissionsService.serveSignature(id, signer, req, res, user);
  }
}
