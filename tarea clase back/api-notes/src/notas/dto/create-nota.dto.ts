import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min, } from 'class-validator';

export class CreateNotaDto {
  @ApiProperty({
    description: 'Título de la nota',
    example: 'Hacer tarea',
    maxLength: 100,
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString({ message: 'El título debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El título es obligatorio' })
  @MaxLength(100, { message: 'El título no puede superar los 100 caracteres' })
  title: string;

  @ApiProperty({
    description: 'Contenido de la nota',
    example: 'Hacer tp de SSDD',
    maxLength: 1000,
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString({ message: 'El texto debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El texto es obligatorio' })
  @MaxLength(1000, { message: 'El texto no puede superar los 1000 caracteres' })
  text: string;

  @ApiProperty({
    description: 'Duración o expiración en minutos',
    example: 15,
    minimum: 1,
  })
  @Type(() => Number)
  @IsInt({ message: 'Los minutos deben ser un número entero' })
  @Min(1, { message: 'Los minutos deben ser como mínimo 1' })
  @IsNotEmpty({ message: 'Los minutos son obligatorios' })
  minutes: number;

  @ApiPropertyOptional({
    description: 'Indica si la nota ya fue notificada',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'El valor de notificado debe ser un booleano' })
  notified?: boolean = false;
}