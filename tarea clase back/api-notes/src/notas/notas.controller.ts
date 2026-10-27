import {
    Body, Controller, Delete, Get, Param,
    ParseUUIDPipe,
    Patch,
    Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { NotasService } from './notas.service.js';
import { CreateNotaDto } from './dto/create-nota.dto.js';
import { UpdateNotaDto } from './dto/update-nota.dto.js';
import { get } from 'http';

@ApiTags('notas')
@Controller('notas')
export class NotasController {
    constructor(private readonly notasService: NotasService) { }

    @Post()
    create(@Body() dto: CreateNotaDto) {
        return this.notasService.create(dto);
    }
    @Get()
    findAll() {
        return this.notasService.findAll();
    }

    //@Get(':id')//este si no se usa 
    //findOne(@Param('id', ParseUUIDPipe) id: string) {
    //    return this.notasService.findOne(id);
    //}

    @Patch(':id')
    update(@Param('id', ParseUUIDPipe) id: string,
        @Body() dto: UpdateNotaDto) {
        return this.notasService.update(id, dto);
    }

    @Delete(':id')
    remove(@Param('id', ParseUUIDPipe) id: string) {
        return this.notasService.remove(id);
    }
}
