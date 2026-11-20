import { AccLevelService } from '../acc-level/acc-level.service.js';
import { AuthDepartmentService } from '../auth-department/auth-department.service.js';
import { BadRequestException, HttpException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { createNewTaskInactivationPayload, createNewTaskMovementPayload, createNewTaskPayload, getCreationTaskRowValues, getInactivationTaskRowValues, getMovementTaskRowValues } from './helpers/task-service.helpers.js';
import { DatabaseHelpers } from '../common/providers/database-helpers.js';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { DateHandlerService } from '../common/services/date-handler.service.js';
import { EmployeesService } from '../employees/employees.service.js';
import { Filters } from '../common/providers/filters.js';
import { IdGeneratorService } from '../common/services/id-generator.service.js';
import { InjectRepository } from '@nestjs/typeorm';
import { paginate } from '../common/helpers/paginate.js';
import { Planification } from '../planifications/entities/planification.entity.js';
import { PlanificationsService } from '../planifications/planifications.service.js';
import { PhotosService } from '../photos/photos.service.js';
import { PositionService } from '../position/position.service.js';
import { Task, TaskStatusEnum, TaskTypeEnum } from './entities/task.entity.js';
import { CreationPayload, InactivatePayload, MovementPayload, TaskPayload } from './interfaces/index.js';
import { TaskQueryDto } from './dto/task-query.dto.js';
import { CreateCreationTaskDto } from './dto/create-creation-task.dto.js';
import { CreateInactivationTaskDto } from './dto/create-inactivation-task.dto.js';
import { CreateMovementTaskDto } from './dto/create-movement-task.dto.js';
import { TaskResource } from './resource/task.resource.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';
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

    private readonly positionService: PositionService,

    private readonly idGenerator: IdGeneratorService,
    private readonly databaseHelpers: DatabaseHelpers,
    private readonly datasource: DataSource,
    private readonly filters: Filters,
    private readonly dateHandler: DateHandlerService,
    private readonly planificationsService: PlanificationsService,
    private readonly photosService: PhotosService,

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

  async update(id: string, updateTaskDto: UpdateTaskDto) {
    try {
      const task = await this.taskRepository.findOne({ where: { id }, relations: { planification: true } });
      if (!task) throw new NotFoundException(`La tarea con ID ${id} no existe`);
      if (task.status !== TaskStatusEnum.pending) throw new BadRequestException(`Solo se pueden editar tareas en estado ${TaskStatusEnum.pending}`);

      this.validateUpdateFields(task.type, updateTaskDto);

      const scheduledAt = updateTaskDto.scheduled_at ?? task.scheduled_at.toString();
      const planification = updateTaskDto.planification_id !== undefined
        ? await this.findPlanification(updateTaskDto.planification_id)
        : task.planification;

      this.validateScheduledAtNotPast(scheduledAt);
      if (planification) this.validateScheduledAtInWeek(scheduledAt, planification);

      const payload = await this.recalculatePayload(task, updateTaskDto, scheduledAt);

      await this.taskRepository.save({ id: task.id, scheduled_at: scheduledAt, planification, payload });

      return this.findOne(task.id);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.databaseHelpers.handleExeptions(error);
    }
  }

  async remove(id: string) {
    const task = await this.findOne(id);
    await this.taskRepository.delete({ id: task.id });

    return `Tarea ${id} eliminada correctamente`;
  }

  async createInactivation(createInactivationTaskDto: CreateInactivationTaskDto, user: User) {
    const { planification_id, pin, scheduled_at, type } = createInactivationTaskDto;

    try {
      const planification = await this.validateSchedule(planification_id, scheduled_at);

      const payload = createNewTaskInactivationPayload(pin, scheduled_at, type);
      const task = await this.saveScheduledTask(TaskTypeEnum.inactivate, payload, scheduled_at, planification, user);

      return this.findOne(task.id);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.databaseHelpers.handleExeptions(error);
    }
  }

  async createCreation(createCreationTaskDto: CreateCreationTaskDto, file: any, user: User) {
    const { planification_id, pin, name, lastName, position_id, auth_dept_id, accLevelIds, scheduled_at } = createCreationTaskDto;

    try {
      const planification = await this.validateSchedule(planification_id, scheduled_at);

      const isActive = await this.employeeService.existsByPin(pin);
      if (isActive) throw new BadRequestException(`El código ${pin} ya pertenece a un empleado activo, utilice un movimiento`);

      const department = await this.validateAssignment(auth_dept_id, accLevelIds);
      const position = position_id ? await this.positionService.findOneRaw(position_id) : null;

      if (file) await this.photosService.upsert(pin, file, user);

      const payload = createNewTaskPayload(name, lastName, pin, department.code, accLevelIds, position?.id);
      const task = await this.saveScheduledTask(TaskTypeEnum.creation, payload, scheduled_at, planification, user);

      return this.findOne(task.id);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.databaseHelpers.handleExeptions(error);
    }
  }

  async createMovement(createMovementTaskDto: CreateMovementTaskDto, user: User) {
    const { planification_id, pin, position_id, auth_dept_id, accLevelIds, scheduled_at } = createMovementTaskDto;

    try {
      const planification = await this.validateSchedule(planification_id, scheduled_at);
      const department = await this.validateAssignment(auth_dept_id, accLevelIds);
      const position = await this.validatePosition(position_id);

      const payload = createNewTaskMovementPayload(position.code, pin, department.code, accLevelIds, position.id);
      const task = await this.saveScheduledTask(TaskTypeEnum.movement, payload, scheduled_at, planification, user);

      return this.findOne(task.id);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.databaseHelpers.handleExeptions(error);
    }
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
    planification: Planification | null
  ) {
    const newTask = this.taskRepository.create({
      type: type,
      pin: payload.pin,
      payload: payload,
      scheduled_at: scheduledAt,
      planification,
      batch_id: batch,
      source_row: `${rowNumber}`,
      source_file: filename,
      created_by: user,
      previous: null
    });

    await queryRunner.manager.save(newTask);
  }

  private async resolveRowSchedule(
    queryRunner: QueryRunner,
    planifications: Map<string, Planification>,
    scheduledAt: string,
    planificationWeek: { week: number; year: number } | null
  ) {
    this.validateScheduledAtNotPast(scheduledAt);
    if (!planificationWeek) return null;

    const { week, year } = planificationWeek;
    const key = `${year}-${week}`;
    let planification = planifications.get(key);

    if (!planification) {
      const found = await queryRunner.manager.findOneBy(Planification, { year, week });
      if (!found) throw new NotFoundException(`La planificación de la semana ${week} del ${year} no existe`);
      planification = found;
      planifications.set(key, planification);
    }

    this.validateScheduledAtInWeek(scheduledAt, planification);
    return planification;
  }

  private async processRows(worksheet: ExcelJS.Worksheet, handler: (row: ExcelJS.Row, rowNumber: number) => Promise<void>) {
    let processed = 0;

    for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
      const row = worksheet.getRow(rowNumber);
      if (!row.hasValues) continue;

      try {
        await handler(row, rowNumber);
        processed++;
      } catch (error) {
        if (error instanceof HttpException) throw new HttpException(`Fila ${rowNumber}: ${error.message}`, error.getStatus());
        throw error;
      }
    }

    if (processed === 0) throw new BadRequestException('El archivo no contiene filas para procesar');
  }

  private async createTaskCreation(filename: string, user: User, queryRunner: QueryRunner, worksheet: ExcelJS.Worksheet) {
    const batch = this.idGenerator.generate32CaracterId();
    const catalogs = await this.loadCatalogs();
    const planifications = new Map<string, Planification>();

    await this.processRows(worksheet, async (row, rowNumber) => {
      const { deptCode, accLevelName, position, name, lastName, code, scheduledAt, planificationWeek } = getCreationTaskRowValues(row);
      const planification = await this.resolveRowSchedule(queryRunner, planifications, scheduledAt, planificationWeek);

      const isActive = await this.employeeService.existsByPin(code);
      if (isActive) throw new BadRequestException(`El código ${code} ya pertenece a un empleado activo, utilice un movimiento`);

      const { department, accLevel } = this.findCatalogEntries(catalogs, deptCode, accLevelName);
      const positionEntity = position ? await this.positionService.findOneRawByCode(position) : null;

      const payload = createNewTaskPayload(name, lastName, code, department.code, accLevel.id, positionEntity?.id);
      await this.commitTaskRow(payload, scheduledAt, batch, rowNumber, filename, TaskTypeEnum.creation, user, queryRunner, planification);
    });

    return 'Altas programadas correctamente';
  }

  private async createTaskMovement(filename: string, user: User, queryRunner: QueryRunner, worksheet: ExcelJS.Worksheet) {
    const batch = this.idGenerator.generate32CaracterId();
    const catalogs = await this.loadCatalogs();
    const planifications = new Map<string, Planification>();

    await this.processRows(worksheet, async (row, rowNumber) => {
      const { deptCode, accLevelName, position, code, scheduledAt, planificationWeek } = getMovementTaskRowValues(row);
      const planification = await this.resolveRowSchedule(queryRunner, planifications, scheduledAt, planificationWeek);

      const { department, accLevel } = this.findCatalogEntries(catalogs, deptCode, accLevelName);
      const positionEntity = await this.positionService.findOneRawByCode(position);

      const payload = createNewTaskMovementPayload(positionEntity.code, code, department.code, accLevel.id, positionEntity.id);
      await this.commitTaskRow(payload, scheduledAt, batch, rowNumber, filename, TaskTypeEnum.movement, user, queryRunner, planification);
    });

    return 'Movimientos Programados Correctamente';
  }

  private async createTaskInactivation(filename: string, user: User, queryRunner: QueryRunner, worksheet: ExcelJS.Worksheet) {
    const batch = this.idGenerator.generate32CaracterId();
    const planifications = new Map<string, Planification>();

    await this.processRows(worksheet, async (row, rowNumber) => {
      const { code, scheduledAt, type, planificationWeek } = getInactivationTaskRowValues(row);
      const planification = await this.resolveRowSchedule(queryRunner, planifications, scheduledAt, planificationWeek);

      const payload = createNewTaskInactivationPayload(code, scheduledAt, type);
      await this.commitTaskRow(payload, scheduledAt, batch, rowNumber, filename, TaskTypeEnum.inactivate, user, queryRunner, planification);
    });

    return 'Bajas Programados Correctamente';
  }

  private async loadCatalogs() {
    const [departments, accLevels] = await Promise.all([
      this.authDepartmentService.getAll(),
      this.accLevelService.getAll(),
    ]);

    return {
      departments: new Map(departments.map(dept => [dept.code, dept])),
      accLevels: new Map(accLevels.map(level => [level.name, level])),
    };
  }

  private findCatalogEntries(catalogs: Awaited<ReturnType<TasksService['loadCatalogs']>>, deptCode: string, accLevelName: string) {
    const department = catalogs.departments.get(deptCode);
    const accLevel = catalogs.accLevels.get(accLevelName);

    if (!department) throw new NotFoundException(`El departamento ${deptCode} no existe`);
    if (!accLevel) throw new NotFoundException(`El nivel de acceso ${accLevelName} no existe`);

    return { department, accLevel };
  }

  private async validateAssignment(authDeptId: string, accLevelIds: string) {
    const department = await this.authDepartmentService.findOne(authDeptId);
    await this.validateAccLevels(accLevelIds);

    return department;
  }

  private async validatePosition(positionId?: string) {
    if (!positionId) throw new BadRequestException('La tarea no tiene una posición asignada, indique position_id');
    return this.positionService.findOneRaw(positionId);
  }

  private async validateAccLevels(accLevelIds: string) {
    const levelIds = (accLevelIds ?? '').split(',').map(id => id.trim()).filter(id => id.length > 0);
    if (levelIds.length === 0) throw new BadRequestException('Debe indicar al menos un nivel de acceso');

    for (const levelId of levelIds) {
      await this.accLevelService.findOne(levelId);
    }
  }

  private async findDepartmentByCode(deptCode: string) {
    const departments = await this.authDepartmentService.getAll();
    const department = departments.find(dept => dept.code === deptCode);
    if (!department) throw new NotFoundException(`El departamento ${deptCode} no existe`);
    return department;
  }

  private validateUpdateFields(type: TaskTypeEnum, updateTaskDto: UpdateTaskDto) {
    const allowedByType: Record<TaskTypeEnum, (keyof UpdateTaskDto)[]> = {
      [TaskTypeEnum.creation]: ['position_id', 'auth_dept_id', 'accLevelIds', 'name', 'lastName'],
      [TaskTypeEnum.movement]: ['position_id', 'auth_dept_id', 'accLevelIds'],
      [TaskTypeEnum.inactivate]: ['type'],
    };
    const payloadFields: (keyof UpdateTaskDto)[] = ['position_id', 'auth_dept_id', 'accLevelIds', 'name', 'lastName', 'type'];

    const invalid = payloadFields.filter(field => updateTaskDto[field] !== undefined && !allowedByType[type].includes(field));
    if (invalid.length > 0) throw new BadRequestException(`Los campos ${invalid.join(', ')} no aplican a una tarea de tipo ${type}`);
  }

  private async recalculatePayload(task: Task, updateTaskDto: UpdateTaskDto, scheduledAt: string): Promise<TaskPayload> {
    if (task.type === TaskTypeEnum.inactivate) {
      const type = updateTaskDto.type ?? (task.payload as InactivatePayload).inactivationType;
      return createNewTaskInactivationPayload(task.pin, scheduledAt, type);
    }

    const current = task.payload as CreationPayload | MovementPayload;
    const department = updateTaskDto.auth_dept_id
      ? await this.authDepartmentService.findOne(updateTaskDto.auth_dept_id)
      : await this.findDepartmentByCode(current.deptCode);
    const accLevelIds = updateTaskDto.accLevelIds ?? current.accLevelIds;
    await this.validateAccLevels(accLevelIds);
    const positionId = updateTaskDto.position_id ?? current.position_id;

    if (task.type === TaskTypeEnum.movement) {
      const position = await this.validatePosition(positionId);
      const { name, lastName } = current as MovementPayload;
      return createNewTaskMovementPayload(position.code, task.pin, department.code, accLevelIds, position.id, name, lastName);
    }

    const name = updateTaskDto.name ?? (current as CreationPayload).name;
    const lastName = updateTaskDto.lastName ?? (current as CreationPayload).lastName;
    const position = positionId ? await this.positionService.findOneRaw(positionId) : null;
    return createNewTaskPayload(name, lastName, task.pin, department.code, accLevelIds, position?.id);
  }

  private async saveScheduledTask(
    type: TaskTypeEnum,
    payload: TaskPayload,
    scheduledAt: string,
    planification: Planification | null,
    user: User,
    previous?: Record<string, unknown>
  ) {
    const newTask = this.taskRepository.create({
      type,
      pin: payload.pin,
      payload,
      scheduled_at: scheduledAt,
      planification,
      created_by: user,
      previous: previous ?? null,
    });

    return this.taskRepository.save(newTask);
  }

  private async validateSchedule(planificationId: string | null | undefined, scheduledAt: string) {
    const planification = await this.findPlanification(planificationId);

    this.validateScheduledAtNotPast(scheduledAt);
    if (planification) this.validateScheduledAtInWeek(scheduledAt, planification);

    return planification;
  }

  private async findPlanification(planificationId: string | null | undefined): Promise<Planification | null> {
    if (!planificationId) return null;
    return this.planificationsService.findOneRaw(planificationId);
  }

  private validateScheduledAtNotPast(scheduledAt: string) {
    const today = this.dateHandler.getCurrentDate('yyyy-MM-dd');
    if (scheduledAt < today) throw new BadRequestException(`La fecha programada ${scheduledAt} no puede ser anterior a hoy (${today})`);
  }

  private validateScheduledAtInWeek(scheduledAt: string, planification: Planification) {
    const startDate = planification.start_date.toString();
    const endDate = planification.end_date.toString();

    if (scheduledAt < startDate || scheduledAt > endDate) {
      throw new BadRequestException(`La fecha programada ${scheduledAt} no está dentro de la semana ${planification.week} del ${planification.year} (${startDate} a ${endDate})`);
    }
  }
}
