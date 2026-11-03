import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto.js';
import { DatabaseHelpers } from '../common/providers/database-helpers.js';
import { EmployeesService } from '../employees/employees.service.js';
import { Filters } from '../common/providers/filters.js';
import { FindOptionsWhere, IsNull, Not, Repository } from 'typeorm';
import { InjectDisk, StorageDisk } from '@nestjs/storage';
import { InjectRepository } from '@nestjs/typeorm';
import { paginate } from '../common/helpers/paginate.js';
import { Permission, SignerEnum } from './entities/permission.entity.js';
import { PermissionQueryDto } from './dto/permission-query.dto.js';
import { PermissionResource } from './resources/permission.resource.js';
import { PermissionSignatureFiles } from './interfaces/index.js';
import { User } from '../auth/entities/user.entity.js';
import { v4 as uuid } from 'uuid';

type PermissionSnapshots = Pick<Permission, 'employee_pin' | 'employee_name' | 'department_name' | 'position_name' | 'substitute_pin' | 'substitute_name'>;

@Injectable()
export class PermissionsService {

  private readonly logger = new Logger(PermissionsService.name);

  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,

    @InjectDisk('private')
    private readonly disk: StorageDisk,

    private readonly employeesService: EmployeesService,
    private readonly databaseHelpers: DatabaseHelpers,
    private readonly filters: Filters,
  ) { }

  async create(createPermissionDto: CreatePermissionDto, files: PermissionSignatureFiles, user: User) {
    const { employee_pin, substitute_pin, date, type, reason, salary_status, shift_start, shift_end } = createPermissionDto;

    this.validateCreateSignatures(files, substitute_pin);
    this.validateShift(shift_start, shift_end);

    const snapshots = await this.loadEmployees(employee_pin, substitute_pin);
    await this.validateDateConflicts(date, snapshots.employee_pin, snapshots.substitute_pin);

    // El id se genera antes del INSERT porque las keys de las firmas dependen de él
    const id = uuid();
    const uploads: [string, Express.Multer.File][] = [
      [this.signatureKey(id, SignerEnum.employee), files.employee_signature![0]],
      [this.signatureKey(id, SignerEnum.supervisor), files.supervisor_signature![0]],
      [this.signatureKey(id, SignerEnum.floor_auditor), files.floor_auditor_signature![0]],
    ];
    if (files.substitute_signature) uploads.push([this.signatureKey(id, SignerEnum.substitute), files.substitute_signature[0]]);

    try {
      await this.permissionRepository.insert({
        id,
        date,
        type,
        reason,
        salary_status,
        shift_start,
        shift_end,
        ...snapshots,
        employee_signature_key: this.signatureKey(id, SignerEnum.employee),
        substitute_signature_key: files.substitute_signature ? this.signatureKey(id, SignerEnum.substitute) : null,
        supervisor_signature_key: this.signatureKey(id, SignerEnum.supervisor),
        floor_auditor_signature_key: this.signatureKey(id, SignerEnum.floor_auditor),
        created_by: user,
      });
    } catch (error) {
      this.databaseHelpers.handleExeptions(error);
    }

    // Regla 13: si falla una subida se borran las firmas ya subidas y el registro
    const uploaded: string[] = [];
    try {
      for (const [key, file] of uploads) {
        await this.disk.put(key, file.buffer, { contentType: 'image/png' });
        uploaded.push(key);
      }
    } catch (error) {
      this.logger.error(error);
      await this.deleteSignatures(uploaded);
      await this.permissionRepository.delete({ id });
      throw new InternalServerErrorException('Hubo un error al guardar las firmas del permiso');
    }

    const permission = await this.findOneEntity(id);
    return PermissionResource.permissionResource(permission);
  }

  async findAll(permissionQueryDto: PermissionQueryDto) {
    const { limit = 10, offset = 0, hr_signed, ...filters } = permissionQueryDto;
    const where = this.filters.buildWhere<Permission, typeof filters>(filters, {
      like: ['employee_pin', 'employee_name', 'substitute_pin'],
      date: ['date'],
    });

    // hr_signed no es columna: se traduce a hr_signed_at
    if (hr_signed !== undefined) where.hr_signed_at = hr_signed === 'true' ? Not(IsNull()) : IsNull();

    const [permissions, total] = await this.permissionRepository.findAndCount({
      take: limit,
      skip: offset,
      where,
      order: { date: 'DESC', folio: 'DESC' },
    });

    return paginate(PermissionResource.collection(permissions), total, limit, offset);
  }

  async findOne(id: string) {
    const permission = await this.findOneEntity(id);
    return PermissionResource.permissionResource(permission);
  }

  private async findOneEntity(id: string) {
    const permission = await this.permissionRepository.findOneBy({ id });
    if (!permission) throw new NotFoundException(`El permiso con ID ${id} no existe`);
    return permission;
  }

  private signatureKey(id: string, signer: SignerEnum) {
    return `permissions/${id}/${signer}.png`;
  }

  // Un fallo al borrar archivos solo se registra
  private async deleteSignatures(keys: string[]) {
    for (const key of keys) {
      try {
        await this.disk.delete(key);
      } catch (error) {
        this.logger.error(`No se pudo eliminar la firma ${key}`, error);
      }
    }
  }

  // Regla 12: firmas obligatorias al crear y coherencia comodín/firma del comodín
  private validateCreateSignatures(files: PermissionSignatureFiles, substitute_pin?: string) {
    const required: (keyof PermissionSignatureFiles)[] = ['employee_signature', 'supervisor_signature', 'floor_auditor_signature'];
    const missing = required.filter(field => !files[field]?.length);
    if (missing.length > 0) {
      throw new BadRequestException(`Faltan firmas obligatorias: ${missing.join(', ')}`);
    }

    const hasSubstituteSignature = !!files.substitute_signature?.length;
    if (hasSubstituteSignature && !substitute_pin) {
      throw new BadRequestException('Se envió substitute_signature sin substitute_pin');
    }
    if (substitute_pin && !hasSubstituteSignature) {
      throw new BadRequestException('substitute_pin requiere substitute_signature');
    }
  }

  // Reglas 2–4: carga trabajador y comodín desde ZKBioAccess y arma los snapshots
  private async loadEmployees(employee_pin: string, substitute_pin?: string | null): Promise<PermissionSnapshots> {
    if (substitute_pin && substitute_pin === employee_pin) {
      throw new BadRequestException('El comodín no puede ser el mismo trabajador');
    }

    const employee = await this.employeesService.findOneByPinWithRelations(employee_pin);
    const substitute = substitute_pin ? await this.employeesService.findOneByPin(substitute_pin) : null;

    return {
      employee_pin: employee.pin,
      employee_name: `${employee.name} ${employee.last_name}`.trim(),
      department_name: employee.authDepartment?.name ?? '',
      position_name: employee.position?.name ?? null,
      substitute_pin: substitute?.pin ?? null,
      substitute_name: substitute ? `${substitute.name} ${substitute.last_name}`.trim() : null,
    };
  }

  // Reglas 7 y 8: conflictos del comodín y del trabajador en la misma fecha
  private async validateDateConflicts(date: string, employee_pin: string, substitute_pin: string | null, excludeId?: string) {
    const idFilter: FindOptionsWhere<Permission> = excludeId ? { id: Not(excludeId) } : {};

    if (substitute_pin) {
      const substituteHasPermission = await this.permissionRepository.existsBy({ ...idFilter, employee_pin: substitute_pin, date });
      if (substituteHasPermission) {
        throw new BadRequestException(`El comodín con código ${substitute_pin} tiene su propio permiso el ${date}`);
      }
    }

    const employeeIsSubstitute = await this.permissionRepository.existsBy({ ...idFilter, substitute_pin: employee_pin, date });
    if (employeeIsSubstitute) {
      throw new BadRequestException(`El trabajador con código ${employee_pin} es comodín de otro permiso el ${date}`);
    }
  }

  // Regla 10: el turno no puede iniciar y terminar a la misma hora (sí puede cruzar medianoche)
  private validateShift(shift_start: string, shift_end: string) {
    if (shift_start.slice(0, 5) === shift_end.slice(0, 5)) {
      throw new BadRequestException('El inicio y el fin de turno no pueden ser iguales');
    }
  }
}
