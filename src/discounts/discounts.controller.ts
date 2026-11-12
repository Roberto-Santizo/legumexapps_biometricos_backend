import { Auth } from '../auth/decorators/auth.decorator.js';
import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ApiPaginatedResponse } from '../common/decorators/index.js';
import { CreateDiscountDto } from './dto/create-discount.dto.js';
import { Discount } from './entities/discount.entity.js';
import { DiscountQueryDto } from './dto/discount-query.dto.js';
import { DiscountsService } from './discounts.service.js';
import { GenerateTransactionsReportDto } from '../common/dto/generate-transactions-report.dto.js';
import { UpdateDiscountDto } from './dto/update-discount.dto.js';
import { ValidRoles } from '../auth/interfaces/interfaces.js';

@ApiTags('Descuentos')
@ApiBearerAuth()
@ApiUnauthorizedResponse({
  description: 'Token ausente o inválido ("Token not valid") o el usuario no está activo ("User is not active")',
})
@Controller('discounts')
export class DiscountsController {
  constructor(private readonly discountsService: DiscountsService) { }

  @Post()
  @Auth(ValidRoles.admin, ValidRoles.rrhh, ValidRoles.merlot)
  @ApiOperation({
    summary: 'Crear descuento',
    description: 'Registra un descuento para un empleado. El código debe corresponder al pin de un empleado existente en ZKBioAccess.',
  })
  @ApiCreatedResponse({ description: 'Descuento creado', type: Discount })
  @ApiBadRequestResponse({ description: 'Body inválido (código, monto menor a 0.1, fecha inválida o propiedades no permitidas)' })
  @ApiForbiddenResponse({ description: 'El usuario autenticado no tiene el rol admin, rrhh o merlot ("Unauthorized")' })
  @ApiNotFoundResponse({ description: 'No existe un empleado con el código indicado ("El usuario con código <code> no existe")' })
  @ApiInternalServerErrorResponse({ description: 'Error al guardar el descuento en la base de datos' })
  create(@Body() createDiscountDto: CreateDiscountDto) {
    return this.discountsService.create(createDiscountDto);
  }

  @Get()
  @Auth(ValidRoles.admin, ValidRoles.rrhh, ValidRoles.merlot)
  @ApiOperation({
    summary: 'Listar descuentos',
    description: 'Devuelve los descuentos paginados, con filtros opcionales por código (búsqueda parcial) y fecha. La respuesta incluye `data`, `total`, `totalPages` y `currentPage`.',
  })
  @ApiPaginatedResponse(Discount, 'Listado paginado de descuentos')
  @ApiBadRequestResponse({
    description: "Parámetros de consulta inválidos o no permitidos, o fecha inválida en date (\"Fecha inválida en 'date': <valor>\")",
  })
  @ApiForbiddenResponse({ description: 'El usuario autenticado no tiene el rol admin, rrhh o merlot ("Unauthorized")' })
  @ApiInternalServerErrorResponse({ description: 'Error al consultar los descuentos en la base de datos' })
  findAll(@Query() discountQueryDto: DiscountQueryDto) {
    return this.discountsService.findAll(discountQueryDto);
  }

  @Get(':id')
  @Auth(ValidRoles.admin, ValidRoles.rrhh, ValidRoles.merlot)
  @ApiOperation({ summary: 'Obtener descuento', description: 'Devuelve un descuento por su ID.' })
  @ApiParam({ name: 'id', type: String, format: 'uuid', description: 'ID del descuento', example: '3f1c2a9e-8b7d-4e6f-9a12-5c4b3d2e1f00' })
  @ApiOkResponse({ description: 'Descuento encontrado', type: Discount })
  @ApiBadRequestResponse({ description: 'El ID no es un UUID válido ("Validation failed (uuid is expected)")' })
  @ApiForbiddenResponse({ description: 'El usuario autenticado no tiene el rol admin, rrhh o merlot ("Unauthorized")' })
  @ApiNotFoundResponse({ description: 'El descuento no existe ("El descuento con ID <id> no existe")' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.discountsService.findOne(id);
  }

  @Patch(':id')
  @Auth(ValidRoles.admin, ValidRoles.rrhh)
  @ApiOperation({ summary: 'Actualizar descuento', description: 'Actualiza parcialmente el código, monto y/o fecha de un descuento.' })
  @ApiParam({ name: 'id', type: String, format: 'uuid', description: 'ID del descuento', example: '3f1c2a9e-8b7d-4e6f-9a12-5c4b3d2e1f00' })
  @ApiOkResponse({ description: 'Descuento actualizado', type: Discount })
  @ApiBadRequestResponse({ description: 'Body inválido (monto menor a 0.1, fecha inválida o propiedades no permitidas)' })
  @ApiForbiddenResponse({ description: 'El usuario autenticado no tiene el rol admin o rrhh ("Unauthorized")' })
  @ApiNotFoundResponse({ description: 'El descuento no existe ("El descuento con ID <id> no existe")' })
  @ApiInternalServerErrorResponse({ description: 'ID con formato inválido o error al guardar el descuento en la base de datos' })
  update(@Param('id') id: string, @Body() updateDiscountDto: UpdateDiscountDto) {
    return this.discountsService.update(id, updateDiscountDto);
  }

  @Delete(':id')
  @Auth(ValidRoles.admin, ValidRoles.rrhh)
  @ApiOperation({ summary: 'Eliminar descuento', description: 'Elimina permanentemente un descuento.' })
  @ApiParam({ name: 'id', type: String, format: 'uuid', description: 'ID del descuento', example: '3f1c2a9e-8b7d-4e6f-9a12-5c4b3d2e1f00' })
  @ApiOkResponse({
    description: 'Descuento eliminado',
    schema: { type: 'string', example: 'Descuento Eliminado Correctamente' },
  })
  @ApiForbiddenResponse({ description: 'El usuario autenticado no tiene el rol admin o rrhh ("Unauthorized")' })
  @ApiNotFoundResponse({ description: 'El descuento no existe ("El descuento con ID <id> no existe")' })
  @ApiInternalServerErrorResponse({ description: 'ID con formato inválido o error al eliminar el descuento en la base de datos' })
  remove(@Param('id') id: string) {
    return this.discountsService.remove(id);
  }

  @Post('report')
  @Auth(ValidRoles.admin, ValidRoles.rrhh, ValidRoles.merlot)
  @ApiOperation({
    summary: 'Generar reporte de descuentos',
    description: 'Genera un archivo Excel (hoja "Descuentos" con código, monto y fecha) con los descuentos cuya fecha está entre start_date y end_date. El archivo se devuelve como un Buffer serializado en JSON.',
  })
  @ApiCreatedResponse({
    description: 'Archivo Excel (.xlsx) generado, serializado como Buffer',
    schema: {
      type: 'object',
      properties: {
        type: { type: 'string', example: 'Buffer' },
        data: { type: 'array', items: { type: 'integer' }, example: [80, 75, 3, 4] },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Body inválido (fechas ausentes, inválidas o propiedades no permitidas)' })
  @ApiForbiddenResponse({ description: 'El usuario autenticado no tiene el rol admin, rrhh o merlot ("Unauthorized")' })
  @ApiInternalServerErrorResponse({ description: 'Error al consultar los descuentos o al generar el archivo Excel' })
  getDiscountReport(@Body() generateTransactionsDto: GenerateTransactionsReportDto) {
    return this.discountsService.getDiscountReport(generateTransactionsDto);
  }
}
