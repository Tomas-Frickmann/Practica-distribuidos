import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { CrearPrestamoDto } from './dto/crear-prestamo.dto';
import { PrestamosService } from './prestamos.service';
import { PaginacionPrestamosDto } from './dto/paginacion-prestamos.dto';

@Controller('prestamos')
export class PrestamosController {
  constructor(private readonly service: PrestamosService) {}

  @Post()
  prestar(@Body() dto: CrearPrestamoDto) {
    return this.service.prestar(dto);
  }

  @Get()
  listar(@Query() query: PaginacionPrestamosDto) {
    return this.service.listar(query);
  }

  @Get('vencidos')
  vencidos() {
    return this.service.listarVencidos();
  }

  @Get(':id')
  obtener(@Param('id', ParseIntPipe) id: number) {
    return this.service.obtener(id);
  }

  @Post(':id/devolucion')
  @HttpCode(200)
  devolver(@Param('id', ParseIntPipe) id: number) {
    return this.service.devolver(id);
  }
}
