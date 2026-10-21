import { AccLevelService } from '../acc-level/acc-level.service.js';
import { AuthDepartmentService } from '../auth-department/auth-department.service.js';
import { BadRequestException, HttpException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { createNewTaskInactivationPayload, createNewTaskMovementPayload, createNewTaskPayload, formatEmployeeEntity, getCreationTaskRowValues, getInactivationTaskRowValues, getMovementTaskRowValues } from './helpers/task-service.helpers.js';
import { DatabaseHelpers } from '../common/providers/database-helpers.js';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { DateHandlerService } from '../common/services/date-handler.service.js';
import { EmployeesService } from '../employees/employees.service.js';
import { Filters } from '../common/providers/filters.js';
import { IdGeneratorService } from '../common/services/id-generator.service.js';
import { InjectRepository } from '@nestjs/typeorm';
import { paginate } from '../common/helpers/paginate.js';
import { Task, TaskTypeEnum } from './entities/task.entity.js';
import { TaskPayload } from './interfaces/index.js';
import { TaskQueryDto } from './dto/task-query.dto.js';
import { TaskResource } from './resource/task.resource.js';
import { User } from '../auth/entities/user.entity.js';
import ExcelJS from 'exceljs';

@Injectable()
export class TasksService {
  private resource: TaskResource;

  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,

    @Inject()
    private readonly authDepartmentService: AuthDepartmentService,

    @Inject()
    private readonly accLevelService: AccLevelService,

    @Inject()
    private readonly employeeService: EmployeesService,

    private readonly idGenerator: IdGeneratorService,
    private readonly databaseHelpers: DatabaseHelpers,
    private readonly datasource: DataSource,
    private readonly filters: Filters,
    private readonly dateHandler: DateHandlerService,

  ) {
    this.resource = new TaskResource(this.dateHandler);
  }

  async findAll(taskQueryDto: TaskQueryDto) {
    const { limit = 10, offset = 0 } = taskQueryDto;
    const where = this.filters.buildWhere<Task, TaskQueryDto>(taskQueryDto, { like: ['pin'], date: ['scheduled_at'] });

    const [tasks, total] = await this.taskRepository.findAndCount({
      take: limit,
      skip: offset,
      where,
    });

    return paginate(this.resource.collection(tasks), total, limit, offset);
  }

  async findOne(id: string) {
    const task = await this.taskRepository.findOneBy({ id });
    if (!task) throw new NotFoundException(`La tarea con ID ${id} no existe`);

    return this.resource.taskEntityToJson(task);
  }

  async remove(id: string) {
    const task = await this.findOne(id);
    await this.taskRepository.delete({ id: task.id });

    return `Tarea ${id} eliminada correctamente`;
  }

  async uploadFile(file: any, user: User, type: string) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(file.buffer);
    const worksheet = workbook.getWorksheet(1);
    const filename = file.originalname;

    if (!worksheet) throw new NotFoundException('No se encontró la hoja de Excel');

    const queryRunner = this.datasource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let result: string | void;
      switch (type) {
        case 'creation':
          result = await this.createTaskCreation(filename, user, queryRunner, worksheet);
          break;
        case 'inactivate':
          result = await this.createTaskInactivation(filename, user, queryRunner, worksheet);
          break;
        case 'movement':
          result = await this.createTaskMovement(filename, user, queryRunner, worksheet);
          break;
        default:
          throw new BadRequestException(`El tipo ${type} no es una acción válida`);
      }

      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      if (queryRunner.isTransactionActive) await queryRunner.rollbackTransaction();
      if (error instanceof HttpException) throw error;
      this.databaseHelpers.handleExeptions(error);
    } finally {
      await queryRunner.release();
    }
  }

  private async commitTaskRow(
    payload: TaskPayload,
    scheduledAt: string,
    batch: string,
    rowNumber: number,
    filename: string,
    type: TaskTypeEnum,
    user: User,
    queryRunner: QueryRunner,
    previous?: Record<string, unknown>
  ) {
    const newTask = this.taskRepository.create({
      type: type,
      pin: payload.pin,
      payload: payload,
      scheduled_at: scheduledAt,
      batch_id: batch,
      source_row: `${rowNumber}`,
      source_file: filename,
      created_by: user,
      previous: previous
    });

    await queryRunner.manager.save(newTask);
  }

  private async createTaskCreation(filename: string, user: User, queryRunner: QueryRunner, worksheet: ExcelJS.Worksheet) {
    const batch = this.idGenerator.generate32CaracterId();

    for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
      const { deptCode, accLevelName, position, name, code, scheduledAt } = getCreationTaskRowValues(worksheet.getRow(rowNumber));
      const { department, accLevel } = await this.validateCreationFields(deptCode, accLevelName);
      const payload = createNewTaskPayload(name, position, code, department.code, accLevel.id)
      await this.commitTaskRow(payload, scheduledAt, batch, rowNumber, filename, TaskTypeEnum.creation, user, queryRunner);
    }

    return 'Altas programadas correctamente';
  }

  private async createTaskMovement(filename: string, user: User, queryRunner: QueryRunner, worksheet: ExcelJS.Worksheet) {
    const batch = this.idGenerator.generate32CaracterId();

    for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
      const { deptCode, accLevelName, position, code, scheduledAt } = getMovementTaskRowValues(worksheet.getRow(rowNumber));
      const { department, accLevel, employee } = await this.validateMovementFields(deptCode, accLevelName, code);
      const payload = createNewTaskMovementPayload(position, code, department.code, accLevel.id, employee.name, employee.last_name);
      const previous = formatEmployeeEntity(employee);
      await this.commitTaskRow(payload, scheduledAt, batch, rowNumber, filename, TaskTypeEnum.movement, user, queryRunner, previous);
    }

    return 'Movimientos Programados Correctamente';
  }

  private async createTaskInactivation(filename: any, user: User, queryRunner: QueryRunner, worksheet: ExcelJS.Worksheet) {
    const batch = this.idGenerator.generate32CaracterId();

    for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
      const { code, scheduledAt } = getInactivationTaskRowValues(worksheet.getRow(rowNumber));
      await this.validateInactivationFields(code);
      const payload = createNewTaskInactivationPayload(code, scheduledAt)
      await this.commitTaskRow(payload, scheduledAt, batch, rowNumber, filename, TaskTypeEnum.inactivate, user, queryRunner);
    }

    return 'Bajas Programados Correctamente';
  }

  private async validateCreationFields(deptCode: string, accLevelName: string) {
    const departments = await this.authDepartmentService.getAll();
    const accLevels = await this.accLevelService.getAll();

    const department = departments.find(dept => dept.code === deptCode);
    const accLevel = accLevels.find(accLevel => accLevel.name === accLevelName);

    if (!department) throw new NotFoundException(`El departamento ${deptCode} no existe`);
    if (!accLevel) throw new NotFoundException(`El nivel de acceso ${accLevelName} no existe`);

    return { department, accLevel }
  }

  private async validateMovementFields(deptCode: string, accLevelName: string, code: string) {
    const departments = await this.authDepartmentService.getAll();
    const accLevels = await this.accLevelService.getAll();
    const employees = await this.employeeService.getAll();

    const department = departments.find(dept => dept.code === deptCode);
    const accLevel = accLevels.find(accLevel => accLevel.name === accLevelName);
    const employee = employees.find(employee => employee.pin === code);

    if (!department) throw new NotFoundException(`El departamento ${deptCode} no existe`);
    if (!accLevel) throw new NotFoundException(`El nivel de acceso ${accLevelName} no existe`);
    if (!employee) throw new NotFoundException(`El empleado con código ${code} no existe`);

    return { department, accLevel, employee }
  }

  private async validateInactivationFields(code: string) {
    const employees = await this.employeeService.getAll();
    const employee = employees.find(employee => employee.pin === code);

    if (!employee) throw new NotFoundException(`El empleado con código ${code} no existe`);

    return { employee };
  }
}
