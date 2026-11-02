import { CreationPayload, InactivatePayload, MovementPayload } from '../interfaces/index.js';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DateHandlerService } from '../../common/services/date-handler.service.js';
import { EmployeesService } from '../../employees/employees.service.js';
import { formatEmployeeEntity } from '../helpers/task-service.helpers.js';
import { imageBufferToBase64 } from '../../common/helpers/base-64-enconder.js';
import { In, LessThanOrEqual, Repository } from 'typeorm';
import { InactiveEmployee } from '../../inactive-employees/entities/inactive-employee.entity.js';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MSSQL_CONNECTION } from '../../common/constants/connections.js';
import { PhotosService } from '../../photos/photos.service.js';
import { Task, TaskStatusEnum, TaskTypeEnum } from '../../tasks/entities/task.entity.js';
import { ZkBioaccessService } from '../../employees/services/zkbioaccess.service.js';

const TIME_ZONE = 'America/Guatemala';
const DATE_PATTERN = 'yyyy-MM-dd';

const TASK_TYPE_ORDER: Record<TaskTypeEnum, number> = {
    [TaskTypeEnum.creation]: 1,
    [TaskTypeEnum.inactivate]: 2,
    [TaskTypeEnum.movement]: 3,
};

@Injectable()
export class CronService {
    private readonly logger = new Logger(CronService.name);
    private inactiveEmployeesByCode: Map<string, InactiveEmployee> = new Map();

    constructor(
        @InjectRepository(Task)
        private readonly taskRepository: Repository<Task>,

        @InjectRepository(InactiveEmployee, MSSQL_CONNECTION)
        private readonly inactiveEmployeeRepository: Repository<InactiveEmployee>,

        @Inject()
        private readonly zbioaccessService: ZkBioaccessService,
        private readonly employeesService: EmployeesService,
        private readonly photosService: PhotosService,

        private readonly dateService: DateHandlerService
    ) { }

    @Cron(CronExpression.EVERY_10_SECONDS, { timeZone: TIME_ZONE })
    async executeTasks() {
        const today = this.getToday();
        const tasksPending = await this.taskRepository.find({
            where: { status: TaskStatusEnum.pending, scheduled_at: LessThanOrEqual(today as unknown as Date) },
            order: { scheduled_at: 'ASC', created_at: 'ASC' },
        });

        if (tasksPending.length === 0) {
            this.logger.debug(`Sin tareas programadas para ${today}`);
            return;
        }

        const pins = [...new Set(tasksPending.map((r) => r.pin))];
        const inactiveEmployees = await this.inactiveEmployeeRepository.find({ where: { pin: In(pins) } });

        this.inactiveEmployeesByCode = new Map(inactiveEmployees.map((employee) => [employee.pin, employee]));

        tasksPending.sort((a, b) => TASK_TYPE_ORDER[a.type] - TASK_TYPE_ORDER[b.type]);

        for (const task of tasksPending) {
            switch (task.type) {
                case TaskTypeEnum.creation:
                    await this.executeCreationTask(task);
                    break;
                case TaskTypeEnum.inactivate:
                    await this.executeInactiveTask(task);
                    break;
                case TaskTypeEnum.movement:
                    await this.executeMovementTask(task);
                    break;
                default:
                    break;
            }
        }

        this.logger.debug(`${tasksPending.length} tareas ejecutadas (scheduled_at <= ${today}) ${this.dateService.getCurrentDate(DATE_PATTERN + ' HH:mm:ss')}`);
    }

    async executeMovementTask(task: Task) {
        if (!this.isDue(task)) return;

        let taskStatus = TaskStatusEnum.pending;
        let last_error = '';
        let previous: Record<string, unknown> | undefined;

        try {
            const employee = await this.employeesService.findOneByPin(task.pin);
            if (!task.previous) previous = formatEmployeeEntity(employee);

            const data = task.payload as MovementPayload;
            const flag = await this.employeesService.createOrUpdateWithPosition({
                pin: data.pin,
                deptCode: data.deptCode,
                accLevelIds: data.accLevelIds,
                name: employee.name,
                lastName: employee.last_name,
                position_id: data.position_id
            });

            if (flag) taskStatus = TaskStatusEnum.completed;
        } catch (error) {
            taskStatus = TaskStatusEnum.failed;
            last_error = error?.toString() ?? 'Error al realizar el movimiento';
            this.debugError(error);
        } finally {
            await this.finishTask(task, taskStatus, last_error, previous);
        }
    }

    async executeInactiveTask(task: Task) {
        if (!this.isDue(task)) return;

        let taskStatus = TaskStatusEnum.pending;
        let last_error = '';

        try {
            await this.employeesService.findOneByPin(task.pin);

            const data = task.payload as InactivatePayload;
            const flag = await this.zbioaccessService.inactivateEmployee({
                pin: data.pin,
                leaveDate: this.dateService.getCurrentDate(),
                leaveType: data.leaveType
            });

            if (flag) taskStatus = TaskStatusEnum.completed;
        } catch (error) {
            taskStatus = TaskStatusEnum.failed;
            last_error = error?.toString() ?? 'Error al realizar la baja';
            this.debugError(error);
        } finally {
            await this.finishTask(task, taskStatus, last_error);
        }
    }

    async executeCreationTask(task: Task) {
        if (!this.isDue(task)) return;

        let taskStatus = TaskStatusEnum.pending;
        let last_error = '';

        try {
            const inactiveEmployeeExists = this.inactiveEmployeesByCode.get(task.pin);
            if (inactiveEmployeeExists) await this.zbioaccessService.reActivateEmployee(task.pin);

            const data = task.payload as CreationPayload;

            const image = await this.photosService.getBuffer(task.pin);

            await this.employeesService.createOrUpdateWithPosition({
                pin: data.pin,
                name: data.name,
                lastName: data.lastName,
                deptCode: data.deptCode,
                accLevelIds: data.accLevelIds,
                position_id: data.position_id
            }, imageBufferToBase64(image));

            taskStatus = TaskStatusEnum.completed;
        } catch (error) {
            this.debugError(error);
            taskStatus = TaskStatusEnum.failed;
            last_error = error?.toString() ?? 'Error al crear el alta';
        } finally {
            await this.finishTask(task, taskStatus, last_error);
        }
    }

    private getToday(): string {
        return this.dateService.getCurrentDate(DATE_PATTERN);
    }

    private isDue(task: Task): boolean {
        if (task.status !== TaskStatusEnum.pending || !task.scheduled_at) return false;

        const scheduledAt = String(task.scheduled_at).slice(0, 10);
        if (scheduledAt <= this.getToday()) return true;

        this.logger.debug(`Tarea ${task.id} omitida: programada para ${scheduledAt}`);
        return false;
    }

    private async finishTask(task: Task, status: TaskStatusEnum, last_error: string, previous?: Record<string, unknown>) {
        await this.taskRepository.save({
            id: task.id,
            status,
            last_error,
            executed_at: this.dateService.getCurrentDate(),
            attempts: task.attempts + 1,
            ...(previous && { previous }),
        });
    }

    private debugError(error: any) {
        this.logger.debug(error);
    }
}
