import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module.js';
import { NotasController } from './notas.controller.js';
import { NotasService } from './notas.service.js';

@Module({
  imports: [DatabaseModule],      // Trae JsonDb de la base de datos
  controllers: [NotasController],  // Registra el controller de notas
  providers: [NotasService],      // Registra el service de notas
  exports: [NotasService],
})
export class NotasModule { }
