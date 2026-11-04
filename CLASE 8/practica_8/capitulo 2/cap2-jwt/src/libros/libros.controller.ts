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
  UseGuards,
} from '@nestjs/common';
import { ActualizarLibroDto } from './dto/actualizar-libro.dto';
import { CrearLibroDto } from './dto/crear-libro.dto';
import { LibrosService } from './libros.service';
import { Roles } from '../auth/guards/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@UseGuards(RolesGuard)
@Controller('libros')
export class LibrosController {
  constructor(private readonly service: LibrosService) { }
  @Roles('bibliotecario')
  @Post()
  create(@Body() dto: CrearLibroDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Roles('bibliotecario')
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarLibroDto,
  ) {
    return this.service.update(id, dto);
  }

  @Roles('bibliotecario')
  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ParseIntPipe) id: number) {
    this.service.remove(id);
  }
}
