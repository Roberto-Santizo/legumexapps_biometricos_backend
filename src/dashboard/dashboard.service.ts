import { AuthDepartment } from '../auth-department/entities/auth-department.entity.js';
import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { DashboardQueryDto } from './dto/index.js';
import {
  DashboardEmployeesInterface,
  DashboardPositionsInterface,
  DashboardSummaryInterface,
  DashboardTasksInterface,
  DashboardTransactionsInterface,
  DateRange,
  TaskStatusCountInterface,
  TaskSummaryInterface,
  TaskTypeCountInterface,
} from './interfaces/index.js';
import { Employee } from '../employees/entities/employee.entity.js';
import { EmployeeTransaction } from '../employee-transactions/entities/employee-transaction.entity.js';
import { InactiveEmployee } from '../inactive-employees/entities/inactive-employee.entity.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MSSQL_CONNECTION } from '../common/constants/connections.js';
import { Photo } from '../photos/entities/photo.entity.js';
import { Position } from '../position/entities/position.entity.js';
import { Task, TaskStatusEnum, TaskTypeEnum } from '../tasks/entities/task.entity.js';

const DAY_MS = 24 * 60 * 60 * 1000;
const DEFAULT_RANGE_DAYS = 30;
const MAX_RANGE_DAYS = 366;
const VACANT_LIST_LIMIT = 50;
const TASK_LIST_LIMIT = 10;

type CountRow = { total: number | string | null };

@Injectable()
export class DashboardService {

  private readonly logger = new Logger(DashboardService.name);

  constructor(
    @InjectRepository(Employee, MSSQL_CONNECTION)
    private readonly employeeRepository: Repository<Employee>,

    @InjectRepository(InactiveEmployee, MSSQL_CONNECTION)
    private readonly inactiveEmployeeRepository: Repository<InactiveEmployee>,

    @InjectRepository(EmployeeTransaction, MSSQL_CONNECTION)
    private readonly employeeTransactionRepository: Repository<EmployeeTransaction>,

    @InjectRepository(AuthDepartment, MSSQL_CONNECTION)
    private readonly authDepartmentRepository: Repository<AuthDepartment>,

    @InjectRepository(Position, MSSQL_CONNECTION)
    private readonly positionRepository: Repository<Position>,

    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,

    @InjectRepository(Photo)
    private readonly photoRepository: Repository<Photo>,
  ) { }

  async getSummary(dashboardQueryDto: DashboardQueryDto): Promise<DashboardSummaryInterface> {
    const range = this.resolveRange(dashboardQueryDto);
    const today = this.todayRange();

    try {
      const [
        employees_total,
        departments_total,
        positions_total,
        positions_occupied,
        transactionsToday,
        tasks_pending,
        tasks_failed,
        inactive_employees_in_range,
        photos_total,
      ] = await Promise.all([
        this.employeeRepository.createQueryBuilder('employee').getCount(),
        this.authDepartmentRepository.createQueryBuilder('department').getCount(),
        this.positionRepository.createQueryBuilder('position').getCount(),
        this.countOccupiedPositions(),
        this.countTransactions(today),
        this.countTasksByStatus(TaskStatusEnum.pending),
        this.countTasksByStatus(TaskStatusEnum.failed),
        this.inactiveEmployeeRepository
          .createQueryBuilder('inactive')
          .where('inactive.leave_date >= :start', { start: range.start })
          .andWhere('inactive.leave_date < :end', { end: range.end })
          .getCount(),
        this.photoRepository.createQueryBuilder('photo').getCount(),
      ]);

      return {
        employees_total,
        departments_total,
        positions_total,
        positions_occupied,
        positions_vacant: positions_total - positions_occupied,
        transactions_today: transactionsToday.total,
        employees_marked_today: transactionsToday.unique_employees,
        tasks_pending,
        tasks_failed,
        inactive_employees_in_range,
        photos_total,
      };
    } catch (error) {
      this.handleError(error, 'el resumen del dashboard');
    }
  }

  async getEmployees(): Promise<DashboardEmployeesInterface> {
    try {
      const [total, with_position, byDepartment] = await Promise.all([
        this.employeeRepository.createQueryBuilder('employee').getCount(),
        this.employeeRepository
          .createQueryBuilder('employee')
          .where('employee.position_id IS NOT NULL')
          .getCount(),
        this.authDepartmentRepository
          .createQueryBuilder('department')
          .leftJoin('department.employees', 'employee')
          .select('department.id', 'dept_id')
          .addSelect('department.code', 'code')
          .addSelect('department.name', 'name')
          .addSelect('COUNT(employee.id)', 'total')
          .groupBy('department.id')
          .addGroupBy('department.code')
          .addGroupBy('department.name')
          .orderBy('total', 'DESC')
          .getRawMany<{ dept_id: string; code: string; name: string } & CountRow>(),
      ]);

      return {
        total,
        with_position,
        without_position: total - with_position,
        by_department: byDepartment.map(row => ({ ...row, total: this.toNumber(row.total) })),
      };
    } catch (error) {
      this.handleError(error, 'las métricas de empleados');
    }
  }

  async getPositions(): Promise<DashboardPositionsInterface> {
    try {
      const [total, occupied, vacant_list] = await Promise.all([
        this.positionRepository.createQueryBuilder('position').getCount(),
        this.countOccupiedPositions(),
        this.positionRepository
          .createQueryBuilder('position')
          .leftJoin('position.employee', 'employee')
          .select('position.id', 'id')
          .addSelect('position.code', 'code')
          .addSelect('position.name', 'name')
          .where('employee.id IS NULL')
          .orderBy('position.sort', 'ASC')
          .limit(VACANT_LIST_LIMIT)
          .getRawMany<{ id: string; code: string; name: string }>(),
      ]);

      return { total, occupied, vacant: total - occupied, vacant_list };
    } catch (error) {
      this.handleError(error, 'las métricas de posiciones');
    }
  }

  async getTransactions(dashboardQueryDto: DashboardQueryDto): Promise<DashboardTransactionsInterface> {
    const range = this.resolveRange(dashboardQueryDto);

    try {
      const [totals, daily, byDevice, byDepartment] = await Promise.all([
        this.countTransactions(range),
        this.transactionsInRange(range)
          .select('CAST(transaction.event_time AS date)', 'work_date')
          .addSelect('COUNT(*)', 'total')
          .addSelect('COUNT(DISTINCT transaction.pin)', 'unique_employees')
          .groupBy('CAST(transaction.event_time AS date)')
          .orderBy('work_date', 'ASC')
          .getRawMany<{ work_date: Date | string; unique_employees: number | string } & CountRow>(),
        this.transactionsInRange(range)
          .select('transaction.dev_alias', 'dev_alias')
          .addSelect('COUNT(*)', 'total')
          .groupBy('transaction.dev_alias')
          .orderBy('total', 'DESC')
          .getRawMany<{ dev_alias: string } & CountRow>(),
        this.transactionsInRange(range)
          .select('transaction.dept_name', 'dept_name')
          .addSelect('COUNT(*)', 'total')
          .groupBy('transaction.dept_name')
          .orderBy('total', 'DESC')
          .getRawMany<{ dept_name: string } & CountRow>(),
      ]);

      return {
        ...this.formatRange(range),
        ...totals,
        daily: daily.map(row => ({
          date: this.toDateString(new Date(row.work_date)),
          total: this.toNumber(row.total),
          unique_employees: this.toNumber(row.unique_employees),
        })),
        by_device: byDevice.map(row => ({ dev_alias: row.dev_alias, total: this.toNumber(row.total) })),
        by_department: byDepartment.map(row => ({ dept_name: row.dept_name, total: this.toNumber(row.total) })),
      };
    } catch (error) {
      this.handleError(error, 'las métricas de marcajes');
    }
  }

  async getTasks(dashboardQueryDto: DashboardQueryDto): Promise<DashboardTasksInterface> {
    const range = this.resolveRange(dashboardQueryDto);
    const today = this.todayRange();

    try {
      const [counts, upcoming, recentFailed] = await Promise.all([
        this.taskRepository
          .createQueryBuilder('task')
          .select('task.type', 'type')
          .addSelect('task.status', 'status')
          .addSelect('COUNT(*)', 'total')
          // scheduled_at es columna `date`: se compara contra 'yyyy-MM-dd' para evitar desfases de zona horaria
          .where('task.scheduled_at >= :start', { start: this.toDateString(range.start) })
          .andWhere('task.scheduled_at < :end', { end: this.toDateString(range.end) })
          .groupBy('task.type')
          .addGroupBy('task.status')
          .getRawMany<{ type: TaskTypeEnum; status: TaskStatusEnum } & CountRow>(),
        this.taskRepository
          .createQueryBuilder('task')
          .leftJoinAndSelect('task.created_by', 'created_by')
          .where('task.status = :status', { status: TaskStatusEnum.pending })
          .andWhere('task.scheduled_at >= :today', { today: this.toDateString(today.start) })
          .orderBy('task.scheduled_at', 'ASC')
          .addOrderBy('task.created_at', 'ASC')
          .take(TASK_LIST_LIMIT)
          .getMany(),
        this.taskRepository.find({
          where: { status: TaskStatusEnum.failed },
          order: { updated_at: 'DESC' },
          take: TASK_LIST_LIMIT,
        }),
      ]);

      const by_status = this.emptyStatusCount();
      const byType = new Map<string, TaskTypeCountInterface>(
        Object.values(TaskTypeEnum).map(type => [type, { type, ...this.emptyStatusCount(), total: 0 }]),
      );

      for (const row of counts) {
        const total = this.toNumber(row.total);
        const typeCount = byType.get(row.type);
        by_status[row.status] += total;
        if (typeCount) {
          typeCount[row.status] += total;
          typeCount.total += total;
        }
      }

      return {
        ...this.formatRange(range),
        by_status,
        by_type: [...byType.values()],
        upcoming: upcoming.map(task => this.taskSummary(task)),
        recent_failed: recentFailed.map(task => this.taskSummary(task)),
      };
    } catch (error) {
      this.handleError(error, 'las métricas de tareas');
    }
  }

  private countOccupiedPositions() {
    return this.positionRepository
      .createQueryBuilder('position')
      .innerJoin('position.employee', 'employee')
      .getCount();
  }

  private countTasksByStatus(status: TaskStatusEnum) {
    return this.taskRepository
      .createQueryBuilder('task')
      .where('task.status = :status', { status })
      .getCount();
  }

  private async countTransactions(range: DateRange) {
    const row = await this.transactionsInRange(range)
      .select('COUNT(*)', 'total')
      .addSelect('COUNT(DISTINCT transaction.pin)', 'unique_employees')
      .getRawOne<{ unique_employees: number | string | null } & CountRow>();

    return {
      total: this.toNumber(row?.total),
      unique_employees: this.toNumber(row?.unique_employees),
    };
  }

  private transactionsInRange({ start, end }: DateRange) {
    return this.employeeTransactionRepository
      .createQueryBuilder('transaction')
      .where('transaction.event_time >= :start', { start })
      .andWhere('transaction.event_time < :end', { end });
  }

  private taskSummary(task: Task): TaskSummaryInterface {
    return {
      id: task.id,
      type: task.type,
      status: task.status,
      pin: task.pin,
      scheduled_at: String(task.scheduled_at),
      attempts: task.attempts,
      last_error: task.last_error,
      created_by: task.created_by?.name ?? '',
    };
  }

  private emptyStatusCount(): TaskStatusCountInterface {
    return { [TaskStatusEnum.pending]: 0, [TaskStatusEnum.completed]: 0, [TaskStatusEnum.failed]: 0 };
  }

  // Rango en UTC (consistente con Filters): por defecto los últimos 30 días incluyendo hoy
  private resolveRange({ start_date, end_date }: DashboardQueryDto): DateRange {
    const endDay = this.startOfDay(end_date ?? new Date());
    const start = start_date
      ? this.startOfDay(start_date)
      : new Date(endDay.getTime() - (DEFAULT_RANGE_DAYS - 1) * DAY_MS);

    if (start > endDay) {
      throw new BadRequestException('start_date no puede ser mayor a end_date');
    }

    if ((endDay.getTime() - start.getTime()) / DAY_MS + 1 > MAX_RANGE_DAYS) {
      throw new BadRequestException(`El rango de fechas no puede ser mayor a ${MAX_RANGE_DAYS} días`);
    }

    return { start, end: new Date(endDay.getTime() + DAY_MS) };
  }

  private todayRange(): DateRange {
    const start = this.startOfDay(new Date());
    return { start, end: new Date(start.getTime() + DAY_MS) };
  }

  private formatRange({ start, end }: DateRange) {
    return {
      start_date: this.toDateString(start),
      end_date: this.toDateString(new Date(end.getTime() - DAY_MS)),
    };
  }

  private startOfDay(date: Date): Date {
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  }

  private toDateString(date: Date): string {
    return date.toISOString().slice(0, 10);
  }

  // Postgres devuelve COUNT como string; MSSQL como number
  private toNumber(value: number | string | null | undefined): number {
    return Number(value ?? 0);
  }

  private handleError(error: unknown, resource: string): never {
    this.logger.error(error);
    throw new InternalServerErrorException(`Error al consultar ${resource}`);
  }
}
