import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe } from '@nestjs/common';
import { DiscountsService } from './discounts.service.js';
import { CreateDiscountDto } from './dto/create-discount.dto.js';
import { UpdateDiscountDto } from './dto/update-discount.dto.js';
import { DiscountQueryDto } from './dto/discount-query.dto.js';
import { GenerateTransactionsReportDto } from '../common/dto/generate-transactions-report.dto.js';

@Controller('discounts')
export class DiscountsController {
  constructor(private readonly discountsService: DiscountsService) { }

  @Post()
  create(@Body() createDiscountDto: CreateDiscountDto) {
    return this.discountsService.create(createDiscountDto);
  }

  @Get()
  findAll(@Query() discountQueryDto: DiscountQueryDto) {
    return this.discountsService.findAll(discountQueryDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.discountsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDiscountDto: UpdateDiscountDto) {
    return this.discountsService.update(id, updateDiscountDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.discountsService.remove(id);
  }

  @Post('report')
  getDiscountReport(@Body() generateTransactionsDto: GenerateTransactionsReportDto) {
    return this.discountsService.getDiscountReport(generateTransactionsDto);
  }
}
