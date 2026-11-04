import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional } from 'class-validator';
import { PaginacionBaseDto } from '../../comun/dto/paginacion-base.dto';

export class PaginacionPrestamosDto extends PaginacionBaseDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  socioId?: number;

  @IsOptional()
  @IsIn(['activo', 'devuelto', 'vencido'])
  estado?: 'activo' | 'devuelto' | 'vencido';
}

