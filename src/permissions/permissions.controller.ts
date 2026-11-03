import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PermissionsService } from './permissions.service.js';

@ApiTags('Permisos de empleados')
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) { }
}
