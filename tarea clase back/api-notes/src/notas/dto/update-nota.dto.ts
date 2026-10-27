import { PartialType } from '@nestjs/swagger';
import { CreateNotaDto } from './create-nota.dto.js';

export class UpdateNotaDto extends PartialType(CreateNotaDto) { }
