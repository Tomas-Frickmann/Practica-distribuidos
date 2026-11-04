import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActualizarLibroDto } from './dto/actualizar-libro.dto';
import { CrearLibroDto } from './dto/crear-libro.dto';
import { Libro } from './entities/libro.entity';
import { PaginacionLibrosDto } from './dto/pag-libros.dto';
import { CursorLibrosDto } from './dto/cursor-libros.dto';
import { paginarQueryBuilder } from '../comun/paginar.util';

@Injectable()
export class LibrosService {
  constructor(
    @InjectRepository(Libro) private readonly repo: Repository<Libro>,
  ) {}

  create(dto: CrearLibroDto): Promise<Libro> {
    return this.repo.save(this.repo.create({ ...dto, disponibles: dto.ejemplares }));
  }

  async findAll(dto: PaginacionLibrosDto) {
    const qb = this.repo.createQueryBuilder('libro');

    // Filtro por categoría
    if (dto.categoria) {
      qb.andWhere('libro.categoria = :categoria', { categoria: dto.categoria });
    }

    // Filtro por rango de año
    if (dto.desdeAnio !== undefined) {
      qb.andWhere('libro.anio >= :desdeAnio', { desdeAnio: dto.desdeAnio });
    }
    if (dto.hastaAnio !== undefined) {
      qb.andWhere('libro.anio <= :hastaAnio', { hastaAnio: dto.hastaAnio });
    }

    // Búsqueda por texto en título O autor
    if (dto.buscar) {
      qb.andWhere('(libro.titulo LIKE :buscar OR libro.autor LIKE :buscar)', {
        buscar: `%${dto.buscar}%`,
      });
    }

    // Orden determinista (con desempate por id)
    const campo = dto.ordenarPor ?? 'id';
    const sentido = (dto.sentido ?? 'ASC').toUpperCase() as 'ASC' | 'DESC';
    qb.orderBy(`libro.${campo}`, sentido);
    if (campo !== 'id') {
      qb.addOrderBy('libro.id', 'ASC');
    }

    return paginarQueryBuilder(qb, dto);
  }

  async findOne(id: number): Promise<Libro> {
    const libro = await this.repo.findOneBy({ id });
    if (!libro) throw new NotFoundException(`El libro ${id} no existe`);
    return libro;
  }

  async update(id: number, dto: ActualizarLibroDto): Promise<Libro> {
    const libro = await this.findOne(id);
    return this.repo.save(Object.assign(libro, dto));
  }

  async remove(id: number): Promise<void> {
    const { affected } = await this.repo.delete(id);
    if (!affected) throw new NotFoundException(`El libro ${id} no existe`);
  }

  // Suma (o resta, si es negativo) ejemplares disponibles
  async ajustarDisponibles(id: number, delta: number): Promise<Libro> {
    const libro = await this.findOne(id);
    libro.disponibles += delta;
    return this.repo.save(libro);
  }

  async cursor(dto: CursorLibrosDto) {
    const limite = dto.limite ?? 20;
    const query = this.repo.createQueryBuilder('libro');
    query.orderBy('libro.titulo', 'ASC').addOrderBy('libro.id', 'ASC');

    if (dto.despues) {
      try {
        const decodificado = JSON.parse(Buffer.from(dto.despues, 'base64url').toString('utf8'));
        query.where(
          '(libro.titulo > :titulo) OR (libro.titulo = :titulo AND libro.id > :id)',
          { titulo: decodificado.titulo, id: decodificado.id },
        );
      } catch {}
    }

    query.take(limite + 1);
    const items = await query.getMany();

    const haySiguiente = items.length > limite;
    const datos = haySiguiente ? items.slice(0, limite) : items;

    let siguiente: string | null = null;
    if (haySiguiente && datos.length > 0) {
      const ultimo = datos[datos.length - 1];
      siguiente = Buffer.from(
        JSON.stringify({ titulo: ultimo.titulo, id: ultimo.id }),
      ).toString('base64url');
    }

    return {
      datos,
      siguiente,
    };
  }
}
