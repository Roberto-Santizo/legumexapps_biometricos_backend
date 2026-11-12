import { Auth } from '../auth/decorators/auth.decorator.js';
import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe } from '@nestjs/common';
import { CreateDiscountDto } from './dto/create-discount.dto.js';
import { DiscountQueryDto } from './dto/discount-query.dto.js';
import { DiscountsService } from './discounts.service.js';
import { GenerateTransactionsReportDto } from '../common/dto/generate-transactions-report.dto.js';
import { UpdateDiscountDto } from './dto/update-discount.dto.js';
import { ValidRoles } from '../auth/interfaces/interfaces.js';

@Controller('discounts')
export class DiscountsController {
  constructor(private readonly discountsService: DiscountsService) { }

  @Post()
  @Auth(ValidRoles.admin, ValidRoles.rrhh, ValidRoles.merlot)
  create(@Body() createDiscountDto: CreateDiscountDto) {
    return this.discountsService.create(createDiscountDto);
  }

  @Get()
  @Auth(ValidRoles.admin, ValidRoles.rrhh, ValidRoles.merlot)
  findAll(@Query() discountQueryDto: DiscountQueryDto) {
    return this.discountsService.findAll(discountQueryDto);
  }

  @Get(':id')
  @Auth(ValidRoles.admin, ValidRoles.rrhh, ValidRoles.merlot)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.discountsService.findOne(id);
  }

  @Patch(':id')
  @Auth(ValidRoles.admin, ValidRoles.rrhh)
  update(@Param('id') id: string, @Body() updateDiscountDto: UpdateDiscountDto) {
    return this.discountsService.update(id, updateDiscountDto);
  }

  @Delete(':id')
  @Auth(ValidRoles.admin, ValidRoles.rrhh)
  remove(@Param('id') id: string) {
    return this.discountsService.remove(id);
  }

  @Post('report')
  @Auth(ValidRoles.admin, ValidRoles.rrhh, ValidRoles.merlot)
  getDiscountReport(@Body() generateTransactionsDto: GenerateTransactionsReportDto) {
    return this.discountsService.getDiscountReport(generateTransactionsDto);
  }
}
