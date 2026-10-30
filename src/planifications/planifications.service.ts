import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { CreatePlanificationDto } from './dto/create-planification.dto.js';
import { DatabaseHelpers } from '../common/providers/database-helpers.js';
import { endOfISOWeek, getISOWeeksInYear, setISOWeek, startOfISOWeek } from 'date-fns';
import { InjectRepository } from '@nestjs/typeorm';
import { Planification } from './entities/planification.entity.js';
import { PlanificationResource } from './resources/planification.resource.js';
import { Repository } from 'typeorm';
import { TZDate } from '@date-fns/tz';
import { User } from '../auth/entities/user.entity.js';

const TIME_ZONE = 'America/Guatemala';

@Injectable()
export class PlanificationsService {
  constructor(
    @InjectRepository(Planification)
    private readonly planificationRepository: Repository<Planification>,

    private readonly databaseHelpers: DatabaseHelpers,
  ) { }

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
      const saved = await this.planificationRepository.findOneByOrFail({ id: planification.id });

      return PlanificationResource.planificationResource(saved);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.databaseHelpers.handleExeptions(error);
    }
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
