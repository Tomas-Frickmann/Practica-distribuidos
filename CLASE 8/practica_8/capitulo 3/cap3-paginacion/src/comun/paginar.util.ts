import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';
import { PaginacionBaseDto } from './dto/paginacion-base.dto';

export interface PaginaResultado<T> {
  datos: T[];
  meta: {
    total: number;
    pagina: number;
    limite: number;
    totalPaginas: number;
  };
}

export async function paginarQueryBuilder<T extends ObjectLiteral>(
  qb: SelectQueryBuilder<T>,
  dto: PaginacionBaseDto,
): Promise<PaginaResultado<T>> {
  const pagina = dto.pagina ?? 1;
  const limite = dto.limite ?? 20;
  const skip = (pagina - 1) * limite;

  qb.skip(skip).take(limite);

  const [datos, total] = await qb.getManyAndCount();

  return {
    datos,
    meta: {
      total,
      pagina,
      limite,
      totalPaginas: Math.ceil(total / limite),
    },
  };
}

