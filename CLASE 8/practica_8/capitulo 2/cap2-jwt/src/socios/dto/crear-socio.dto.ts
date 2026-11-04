import { IsEmail, IsString, MinLength, IsIn, IsOptional } from 'class-validator';

export class CrearSocioDto {
  @IsString()
  @MinLength(2)
  nombre: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsIn(['socio', 'bibliotecario'])
  rol?: 'socio' | 'bibliotecario';

  @IsString()
  @MinLength(6)
  password: string;

}
