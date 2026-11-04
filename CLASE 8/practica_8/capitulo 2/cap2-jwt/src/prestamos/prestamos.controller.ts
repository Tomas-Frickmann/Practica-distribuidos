import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CrearPrestamoDto } from './dto/crear-prestamo.dto';
import { PrestamosService } from './prestamos.service';
import { Roles } from '../auth/guards/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '@nestjs/authentication';
import { Socio } from '../socios/entities/socio.entity';

@UseGuards(RolesGuard)
@Controller('prestamos')
export class PrestamosController {
  constructor(private readonly service: PrestamosService) { }

  @Post()
  prestar(@Body() dto: CrearPrestamoDto, @CurrentUser() usuario: Socio) {

    return this.service.prestar(dto, usuario.id);
  }

  @Get()
  listar() {
    return this.service.listar();
  }

  @Roles('bibliotecario')
  @Get('vencidos')
  vencidos() {
    return this.service.listarVencidos();
  }

  @Get(':id')
  obtener(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() usuario: Socio,
  ) {
    return this.service.obtener(id, usuario);
  }

  @Post(':id/devolucion')
  @HttpCode(200)
  devolver(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() usuario: Socio,
  ) {
    return this.service.devolver(id, usuario);
  }
}
