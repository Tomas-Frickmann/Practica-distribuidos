import { randomUUID } from 'node:crypto';
import { Injectable, NotFoundException, } from '@nestjs/common';
import { JsonDb, NotaGuardada } from '../database/json-db.js';
import { CreateNotaDto } from './dto/create-nota.dto.js';
import { UpdateNotaDto } from './dto/update-nota.dto.js';
@Injectable()
export class NotasService {
    constructor(private readonly db: JsonDb) { }

    create(dto: CreateNotaDto): Promise<NotaGuardada> {
        return this.db.update((data) => {

            const nuevaNota: NotaGuardada = {
                id: randomUUID(),
                title: dto.title,
                text: dto.text,
                minutes: dto.minutes,
                createdAt: Date.now(),
                notified: dto.notified ?? false,
            };

            data.notas.push(nuevaNota);
            return nuevaNota;
        });
    }

    async findAll(): Promise<NotaGuardada[]> {
        const data = await this.db.read();
        return [...data.notas].sort((a, b) => b.createdAt - a.createdAt);
        // en lugar de ordenar por fecha de inscripcion si no lo pongo no pasa nada 
        // solo va a estar en otro orden

    }

    //async findOne(id: string): Promise<NotaGuardada> {
    //    const data = await this.db.read();
    //    const alumno = data.notas.find((item) => item.id === id);
    //    if (!alumno) throw new NotFoundException('Nota no encontrada');
    //    return alumno;
    //}
    //esto se usa para modificar las notas o borrarlas
    update(id: string, dto: UpdateNotaDto): Promise<NotaGuardada> {
        return this.db.update((data) => {
            const nota = data.notas.find((item) => item.id === id);

            if (!nota) {
                throw new NotFoundException(`Nota con id ${id} no encontrada`);
            }

            // Si cambió el título, texto o minutos, reiniciamos el tiempo de validez
            if (dto.title !== undefined) nota.title = dto.title;
            if (dto.text !== undefined) nota.text = dto.text;
            if (dto.minutes !== undefined) nota.minutes = dto.minutes;

            if (dto.notified !== undefined) {
                nota.notified = dto.notified;
            } else if (dto.title !== undefined || dto.text !== undefined || dto.minutes !== undefined) {
                nota.createdAt = Date.now();
                nota.notified = false;
            }

            return nota;
        });
    }

    remove(id: string): Promise<{ mensaje: string; id: string }> {
        return this.db.update((data) => {
            const index = data.notas.findIndex((item) => item.id === id);

            if (index === -1) {
                throw new NotFoundException(`Nota con id ${id} no encontrada`);
            }

            data.notas.splice(index, 1);
            return { mensaje: 'Nota eliminada correctamente', id };
        });
    }
}


