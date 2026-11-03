import { Body, Controller, Delete, Get, Param, ParseEnumPipe, ParseUUIDPipe, Patch, Post, Query, Req, Res, UploadedFile, UploadedFiles, UseInterceptors } from '@nestjs/common';
import type { Request, Response } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { Auth } from '../auth/decorators/auth.decorator.js';
import { CreatePermissionDto } from './dto/create-permission.dto.js';
import { FileFieldsInterceptor, FileInterceptor, NoFilesInterceptor } from '@nestjs/platform-express';
import { GetUser } from '../auth/decorators/get-user.decorator.js';
import { type PermissionSignatureFiles } from './interfaces/index.js';
import { PermissionQueryDto } from './dto/permission-query.dto.js';
import { PermissionsService } from './permissions.service.js';
import { SignerEnum } from './entities/permission.entity.js';
import { UpdatePermissionDto } from './dto/update-permission.dto.js';
import { User } from '../auth/entities/user.entity.js';
import { ValidRoles } from '../auth/interfaces/interfaces.js';
import { signatureFilter } from '../common/helpers/signature-filter.js';

const SIGNATURE_LIMITS = { fileSize: 1024 * 1024 };

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
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
    @GetUser() user: User,
  ) {
    return this.permissionsService.update(id, updatePermissionDto, user);
  }

  @Delete(':id')
  @Auth(ValidRoles.admin, ValidRoles.rrhh)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.permissionsService.remove(id);
  }

  @Get()
  @Auth()
  findAll(@Query() permissionQueryDto: PermissionQueryDto) {
    return this.permissionsService.findAll(permissionQueryDto);
  }

  @Get(':id')
  @Auth()
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.permissionsService.findOne(id);
  }

  @Get(':id/signatures/:signer')
  @Auth()
  serveSignature(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('signer', new ParseEnumPipe(SignerEnum)) signer: SignerEnum,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.permissionsService.serveSignature(id, signer, req, res);
  }
}
