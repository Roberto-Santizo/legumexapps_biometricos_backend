import { Body, Controller, Post, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Auth } from '../auth/decorators/auth.decorator.js';
import { CreatePermissionDto } from './dto/create-permission.dto.js';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { GetUser } from '../auth/decorators/get-user.decorator.js';
import { type PermissionSignatureFiles } from './interfaces/index.js';
import { PermissionsService } from './permissions.service.js';
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
}
