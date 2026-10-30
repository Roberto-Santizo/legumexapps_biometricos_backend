import { BadRequestException, HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePlanificationDto } from './dto/create-planification.dto.js';
import { DatabaseHelpers } from '../common/providers/database-helpers.js';
import { DateHandlerService } from '../common/services/date-handler.service.js';
import { endOfISOWeek, getISOWeeksInYear, setISOWeek, startOfISOWeek } from 'date-fns';
import { Filters } from '../common/providers/filters.js';
import { InjectRepository } from '@nestjs/typeorm';
import { paginate } from '../common/helpers/paginate.js';
import { Planification } from './entities/planification.entity.js';
import { PlanificationCounts } from './interfaces/index.js';
import { PlanificationQueryDto } from './dto/planification-query.dto.js';
import { PlanificationResource } from './resources/planification.resource.js';
import { Repository } from 'typeorm';
import { Task, TaskStatusEnum, TaskTypeEnum } from '../tasks/entities/task.entity.js';
import { TaskResource } from '../tasks/resource/task.resource.js';
import { TZDate } from '@date-fns/tz';
import { User } from '../auth/entities/user.entity.js';

const TIME_ZONE = 'America/Guatemala';

@Injectable()
export class PlanificationsService {
  private taskResource: TaskResource;

  constructor(
    @InjectRepository(Planification)
    private readonly planificationRepository: Repository<Planification>,

    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,

    private readonly databaseHelpers: DatabaseHelpers,
    private readonly filters: Filters,
    private readonly dateHandler: DateHandlerService,
  ) {
    this.taskResource = new TaskResource(this.dateHandler);
  }

  async create(createPlanificationDto: CreatePlanificationDto, user: User) {
    const { year, week } = createPlanificationDto;

    try {
      const { start_date, end_date } = this.getISOWeekRange(year, week);

      const exists = await this.planificationRepository.findOneBy({ year, week });
      if (exists) throw new BadRequestException(`La planificación de la semana ${week} del año ${year} ya existe`);

      const planification = this.planificationRepository.create({
        year,
        week,
        start_date,
        end_date,
        created_by: user,
      });

      await this.planificationRepository.save(planification);

      // Se recarga para obtener las fechas como 'YYYY-MM-DD' desde la base de datos
      const saved = await this.findOneRaw(planification.id);
      return PlanificationResource.planificationResource(saved);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.databaseHelpers.handleExeptions(error);
    }
  }

  async findAll(planificationQueryDto: PlanificationQueryDto) {
    const { limit = 10, offset = 0 } = planificationQueryDto;
    const where = this.filters.buildWhere<Planification, PlanificationQueryDto>(planificationQueryDto);

    const [planifications, total] = await this.planificationRepository.findAndCount({
      take: limit,
      skip: offset,
      where,
      order: { year: 'DESC', week: 'DESC' },
    });

    const counts = await this.getTaskCounts(planifications.map(planification => planification.id));
    const data = planifications.map(planification =>
      PlanificationResource.withCounts(planification, counts.get(planification.id) ?? this.emptyCounts())
    );

    return paginate(data, total, limit, offset);
  }

  async findOne(id: string) {
    const planification = await this.findOneRaw(id);
    return PlanificationResource.planificationResource(planification);
  }

  async findTasks(id: string) {
    const planification = await this.findOneRaw(id);
    const tasks = await this.taskRepository.find({
      where: { planification: { id: planification.id } },
      order: { scheduled_at: 'ASC', created_at: 'ASC' },
    });

    return this.taskResource.collection(tasks);
  }

  async findOneRaw(id: string) {
    const planification = await this.planificationRepository.findOneBy({ id });
    if (!planification) throw new NotFoundException(`La planificación con ID ${id} no existe`);
    return planification;
  }

  async remove(id: string) {
    const planification = await this.findOneRaw(id);

    const tasks = await this.taskRepository.countBy({ planification: { id: planification.id } });
    if (tasks > 0) throw new BadRequestException(`La planificación tiene ${tasks} tarea(s) asociada(s) y no puede eliminarse`);

    await this.planificationRepository.delete({ id: planification.id });

    return `Planificación ${id} eliminada correctamente`;
  }

  // Cuenta las tareas de cada planificación agrupando por tipo y estado
  private async getTaskCounts(planificationIds: string[]) {
    const counts = new Map<string, PlanificationCounts>();
    if (planificationIds.length === 0) return counts;

    const rows = await this.taskRepository
      .createQueryBuilder('task')
      .select('"task"."planification_id"', 'planification_id')
      .addSelect('task.type', 'type')
      .addSelect('task.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('"task"."planification_id" IN (:...planificationIds)', { planificationIds })
      .groupBy('"task"."planification_id"')
      .addGroupBy('task.type')
      .addGroupBy('task.status')
      .getRawMany<{ planification_id: string; type: TaskTypeEnum; status: TaskStatusEnum; count: string }>();

    for (const row of rows) {
      const current = counts.get(row.planification_id) ?? this.emptyCounts();
      const count = Number(row.count);

      current.total += count;
      current.by_type[row.type] += count;
      current.by_status[row.status] += count;

      counts.set(row.planification_id, current);
    }

    return counts;
  }

  private emptyCounts(): PlanificationCounts {
    return {
      total: 0,
      by_type: { movimiento: 0, alta: 0, baja: 0 },
      by_status: { pendiente: 0, completada: 0, fallida: 0 },
    };
  }

  // Calcula el lunes y domingo de la semana ISO en zona America/Guatemala
  private getISOWeekRange(year: number, week: number) {
    // El 4 de enero siempre pertenece a la semana 1 del año ISO
    const reference = new TZDate(year, 0, 4, TIME_ZONE);

    if (week > getISOWeeksInYear(reference)) {
      throw new BadRequestException(`El año ${year} no tiene la semana ${week}`);
    }

    const date = setISOWeek(reference, week);

    return {
      start_date: startOfISOWeek(date),
      end_date: endOfISOWeek(date),
    };
  }
}
