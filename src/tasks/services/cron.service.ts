import { CreationPayload, InactivatePayload, MovementPayload } from '../interfaces/index.js';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DateHandlerService } from '../../common/services/date-handler.service.js';
import { EmployeesService } from '../../employees/employees.service.js';
import { imageBufferToBase64 } from '../../common/helpers/base-64-enconder.js';
import { In, Repository } from 'typeorm';
import { InactiveEmployee } from '../../inactive-employees/entities/inactive-employee.entity.js';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MSSQL_CONNECTION } from '../../common/constants/connections.js';
import { PhotosService } from '../../photos/photos.service.js';
import { Task, TaskStatusEnum, TaskTypeEnum } from '../../tasks/entities/task.entity.js';
import { ZkBioaccessService } from '../../employees/services/zkbioaccess.service.js';

@Injectable()
export class CronService {
    private readonly logger = new Logger(CronService.name);
    private inactiveEmployeesByCode: Map<string, InactiveEmployee>;

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

    @Cron('0 0 5 * * *', { timeZone: 'America/Guatemala' })
    // @Cron(CronExpression.EVERY_10_SECONDS)
    async executeTasks() {
        const tasksPending = await this.taskRepository.find({ where: { status: TaskStatusEnum.pending } });
        const pins = [...new Set(tasksPending.map((r) => r.pin))];
        const inactiveEmployees = await this.inactiveEmployeeRepository.find({ where: { pin: In(pins) } });

        this.inactiveEmployeesByCode = new Map(inactiveEmployees.map((employee) => [employee.pin, employee]));

        tasksPending.map(async task => {
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
        });

        this.logger.debug(`Tarea ejecutada correctamente ${this.dateService.getCurrentDate()}`);
    }

    async executeMovementTask(task: Task) {
        let taskStatus = TaskStatusEnum.pending;
        let last_error = '';

        try {
            const data = task.payload as MovementPayload;
            const flag = await this.employeesService.createOrUpdateWithPosition({
                pin: data.pin,
                deptCode: data.deptCode,
                accLevelIds: data.accLevelIds,
                name: data.name,
                lastName: data.lastName,
                position_id: data.position_id
            });

            if (flag) taskStatus = TaskStatusEnum.completed;
        } catch (error) {
            taskStatus = TaskStatusEnum.failed;
            last_error = error?.toString() ?? 'Error al realizar el movimiento';
            this.debugError(error);
        } finally {
            await this.taskRepository.update(task.id, { status: taskStatus, last_error });
        }
    }

    async executeInactiveTask(task: Task) {
        let taskStatus = TaskStatusEnum.pending;
        let last_error = '';

        try {
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
            await this.taskRepository.update(task.id, { status: taskStatus, last_error });
        }
    }

    async executeCreationTask(task: Task) {
        let taskStatus = TaskStatusEnum.pending;
        let last_error = '';

        try {
            const inactiveEmployeeExists = this.inactiveEmployeesByCode.get(task.pin);
            if (inactiveEmployeeExists) this.zbioaccessService.reActivateEmployee(task.pin);

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
            await this.taskRepository.update(task.id, { status: taskStatus, last_error });
        }
    }

    private debugError(error: any) {
        this.logger.debug(error);
    }
}
