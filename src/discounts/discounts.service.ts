import { CreateDiscountDto } from './dto/create-discount.dto.js';
import { Discount } from './entities/discount.entity.js';
import { DiscountQueryDto } from './dto/discount-query.dto.js';
import { EmployeesService } from '../employees/employees.service.js';
import { Filters } from '../common/providers/filters.js';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { paginate } from '../common/helpers/paginate.js';
import { Repository } from 'typeorm';
import { UpdateDiscountDto } from './dto/update-discount.dto.js';

@Injectable()
export class DiscountsService {
  constructor(
    @InjectRepository(Discount)
    private readonly discountRepository: Repository<Discount>,

    private readonly employeeService: EmployeesService,
    private readonly filters: Filters,
  ) { }

  async create(createDiscountDto: CreateDiscountDto) {
    await this.employeeService.findOneByPin(createDiscountDto.code);
    const discount = this.discountRepository.create(createDiscountDto);
    await this.discountRepository.save(discount);
    return discount;
  }

  async findAll(discountQueryDto: DiscountQueryDto) {
    const { limit = 10, offset = 0 } = discountQueryDto;
    const where = this.filters.buildWhere<Discount, DiscountQueryDto>(discountQueryDto, { like: ['code'], date: ['date'] });
    
    const [discounts, total] = await this.discountRepository.findAndCount({
      take: limit,
      skip: offset,
      where
    });

    return paginate(discounts, total, limit, offset);
  }

  async findOne(id: string) {
    const discount = await this.discountRepository.findOneBy({ id });

    if(!discount) throw new NotFoundException(`El descuento con ID ${id} no existe`);
    
    return discount;
  }

  async update(id: string, updateDiscountDto: UpdateDiscountDto) {
    const discount = await this.discountRepository.preload({ id, ...updateDiscountDto });
    if(!discount) throw new NotFoundException(`El descuento con ID ${id} no existe`);

    await this.discountRepository.save(discount);
    return discount;
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.discountRepository.delete({ id });
    
    return 'Descuento Eliminado Correctamente';
  }
}
