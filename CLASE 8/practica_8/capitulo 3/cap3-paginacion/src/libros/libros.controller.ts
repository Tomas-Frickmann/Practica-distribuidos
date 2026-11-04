import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ActualizarLibroDto } from './dto/actualizar-libro.dto';
import { CrearLibroDto } from './dto/crear-libro.dto';
import { LibrosService } from './libros.service';
import { Query } from '@nestjs/common';
import { PaginacionLibrosDto } from './dto/pag-libros.dto';
import { CursorLibrosDto } from './dto/cursor-libros.dto';

@Controller('libros')
export class LibrosController {
  constructor(private readonly service: LibrosService) { }


  @Get('cursor')
  cursor(@Query() dto: CursorLibrosDto) {
    return this.service.cursor(dto);
  }

  @Post()
  create(@Body() dto: CrearLibroDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Query() paginacion: PaginacionLibrosDto) {
    return this.service.findAll(paginacion);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarLibroDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ParseIntPipe) id: number) {
    this.service.remove(id);
  }
}
