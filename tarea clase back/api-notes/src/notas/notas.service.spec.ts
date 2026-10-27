import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { NotasService } from './notas.service.js';
import { JsonDb } from '../database/json-db.js';


describe('NotasService', () => {
    let directory: string;
    let service: NotasService;
    let db: JsonDb;
    const previousDataFile = process.env.DATA_FILE;

    beforeEach(async () => {
        directory = await mkdtemp(join(tmpdir(), 'notas-test-'));
        process.env.DATA_FILE = join(directory, 'db.json');
        const module: TestingModule = await Test.createTestingModule({
            providers: [NotasService, JsonDb],
        }).compile();
        service = module.get(NotasService);
        db = module.get(JsonDb);
    });

    afterEach(async () => {
        if (previousDataFile === undefined) delete process.env.DATA_FILE;
        else process.env.DATA_FILE = previousDataFile;
        await rm(directory, { recursive: true, force: true });
    });

    it('Crear una nota bien', async () => {

        let nota = await service.create({
            title: "Hola",
            text: "chau",
            minutes: 15
        });
        expect(nota.id).toBeDefined();
        expect(nota.title).toBe("Hola")
        expect(nota.text).toBe("chau")
        expect(nota.notified).toBe(false)
        expect(nota.minutes).toBe(15);

        let notas = await service.findAll();
        expect(notas.length).toBe(1);
        nota = await service.create({
            title: "Hola2",
            text: "chau",
            minutes: 15
        });
        notas = await service.findAll();
        expect(notas.length).toBe(2);
    })

    it('Modificar nota', async () => {

        let nota = await service.create({
            title: "Hola",
            text: "chau",
            minutes: 15
        });

        let notaModi = await service.update(nota.id, {
            title: "Chau",
            text: "Hola",

        });
        expect(notaModi.id).toBeDefined();
        expect(notaModi.text).toBe("Hola")
        expect(notaModi.title).toBe("Chau")
        expect(notaModi.notified).toBe(false)
        expect(notaModi.minutes).toBe(15);


    })
    it('elimina una nota ', async () => {
        const creada = await service.create({
            title: 'Para borrar',
            text: 'Texto',
            minutes: 5,
        });

        await service.remove(creada.id);

        const todas = await service.findAll();
        expect(todas.length).toBe(0);
    });

    it('lanza NotFoundException al intentar borrar  nota inexistente', async () => {
        await expect(service.remove('1234')).rejects.toBeInstanceOf(
            NotFoundException,
        );
    });


});
