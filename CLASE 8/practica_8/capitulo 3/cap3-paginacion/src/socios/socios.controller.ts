import { Body, Controller, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { CrearSocioDto } from './dto/crear-socio.dto';
import { SociosService } from './socios.service';
import { PaginacionSociosDto } from './dto/paginacion-socios.dto';

@Controller('socios')
export class SociosController {
  constructor(private readonly service: SociosService) {}

  @Post()
  create(@Body() dto: CrearSocioDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Query() query: PaginacionSociosDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }
}
