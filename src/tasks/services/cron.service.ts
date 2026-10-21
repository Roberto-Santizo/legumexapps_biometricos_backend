import { CreationPayload, InactivatePayload, MovementPayload } from '../interfaces/index.js';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DateHandlerService } from '../../common/services/date-handler.service.js';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task, TaskStatusEnum, TaskTypeEnum } from '../../tasks/entities/task.entity.js';
import { ZkBioaccessService } from '../../employees/services/zkbioaccess.service.js';

@Injectable()
export class CronService {
    private readonly logger = new Logger(CronService.name);

    constructor(
        @InjectRepository(Task)
        private readonly taskRepository: Repository<Task>,

        @Inject()
        private readonly zbioaccessService: ZkBioaccessService,
        private readonly dateService: DateHandlerService
    ) { }

    @Cron('0 0 5 * * *', {
        timeZone: 'America/Guatemala',
    })
    async executeTasks() {
        const tasksPending = await this.taskRepository.find({
            where: { status: TaskStatusEnum.pending }
        });

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

        try {
            const data = task.payload as MovementPayload;
            const flag = await this.zbioaccessService.createOrUpdateEmployee({
                pin: data.pin,
                deptCode: data.deptCode,
                accLevelIds: data.accLevelIds,
                name: data.name,
                lastName: data.lastName,
            });

            if (flag) taskStatus = TaskStatusEnum.completed;
        } catch (error) {
            taskStatus = TaskStatusEnum.failed;
            console.log(error);
        } finally {
            await this.taskRepository.update(task.id, { status: taskStatus });
        }
    }

    async executeInactiveTask(task: Task) {
        let taskStatus = TaskStatusEnum.pending;

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
            console.log(error);
        } finally {
            await this.taskRepository.update(task.id, { status: taskStatus });
        }
    }

    async executeCreationTask(task: Task) {
        let taskStatus = TaskStatusEnum.pending;

        try {
            const data = task.payload as CreationPayload;
            const flag = await this.zbioaccessService.createOrUpdateEmployee({
                pin: data.pin,
                name: data.name,
                lastName: data.lastName,
                deptCode: data.deptCode,
                accLevelIds: data.accLevelIds,
            });

            if (flag) taskStatus = TaskStatusEnum.completed;
        } catch (error) {
            taskStatus = TaskStatusEnum.failed;
            console.log(error);
        } finally {
            await this.taskRepository.update(task.id, { status: taskStatus });
        }
    }
}
