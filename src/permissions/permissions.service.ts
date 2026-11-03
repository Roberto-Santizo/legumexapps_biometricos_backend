import { BadRequestException, Injectable } from '@nestjs/common';
import { EmployeesService } from '../employees/employees.service.js';
import { FindOptionsWhere, Not, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Permission } from './entities/permission.entity.js';

type PermissionSnapshots = Pick<Permission, 'employee_pin' | 'employee_name' | 'department_name' | 'position_name' | 'substitute_pin' | 'substitute_name'>;

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,

    private readonly employeesService: EmployeesService,
  ) { }

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
