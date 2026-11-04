import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString } from 'class-validator';
import { PaginacionBaseDto } from '../../comun/dto/paginacion-base.dto';

export class PaginacionLibrosDto extends PaginacionBaseDto {

  @IsOptional()
  @IsIn(['id', 'titulo', 'autor', 'anio', 'ejemplares', 'disponibles'])
  ordenarPor?: string = 'id';

  @IsOptional()
  @IsIn(['ASC', 'DESC', 'asc', 'desc'])
  sentido?: 'ASC' | 'DESC' | 'asc' | 'desc' = 'ASC';

  // Filtro
  @IsOptional()
  @IsString()
  categoria?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  desdeAnio?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  hastaAnio?: number;

  @IsOptional()
  @IsString()
  buscar?: string;
}
