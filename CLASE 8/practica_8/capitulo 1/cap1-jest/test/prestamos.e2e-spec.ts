import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { AppModule } from "../src/app.module";
import { configurarApp } from "../src/app.setup";

import request from 'supertest';

import supertest from "supertest";

describe('prestamos e2e', () => {

    let app: INestApplication;
    beforeEach(async () => {
        const modulo = await Test.createTestingModule({ imports: [AppModule] }).compile();
        app = modulo.createNestApplication();
        configurarApp(app); // la misma configuración que main.ts
        await app.init();
    });
    afterEach(() => app.close());

    it('flujo completo: registrar libro -> registrar socio -> prestar -> devolver', async () => {
        const server = app.getHttpServer();

        //creo libro
        const resLibro = await request(server)
            .post('/libros')
            .send({
                titulo: 'Rayuela',
                autor: 'Julio Cortázar',
                isbn: '9788437604572',
                categoria: 'novela',
                anio: 1963,
                ejemplares: 1,
            })
            .expect(201);

        const libroId = resLibro.body.id;
        expect(resLibro.body.disponibles).toBe(1);

        //creo socio 
        const resSocio = await request(server)
            .post('/socios')
            .send({
                nombre: 'Tomas Frickmann',
                email: 'tomasfrickmann@gmail.com',
            })
            .expect(201);

        const socioId = resSocio.body.id;

        // hago prestamo
        const resPrestamo = await request(server)
            .post('/prestamos')
            .send({
                libroId: libroId,
                socioId: socioId,
            })
            .expect(201);

        const prestamoId = resPrestamo.body.id;


        const resLibroSinStock = await request(server)
            .get(`/libros/${libroId}`)
            .expect(200);

        expect(resLibroSinStock.body.disponibles).toBe(0);

        await request(server)
            .post(`/prestamos/${prestamoId}/devolucion`)
            .expect(200);

        const resLibroConStock = await request(server)
            .get(`/libros/${libroId}`)
            .expect(200);

        expect(resLibroConStock.body.disponibles).toBe(1);
    });

    it('devolucion de prestamo ya devuelto ', async () => {
        const server = app.getHttpServer();

        //creo libro
        const resLibro = await request(server)
            .post('/libros')
            .send({
                titulo: 'Rayuela',
                autor: 'Julio Cortázar',
                isbn: '9788437604572',
                categoria: 'novela',
                anio: 1963,
                ejemplares: 1,
            })
            .expect(201);

        const libroId = resLibro.body.id;
        expect(resLibro.body.disponibles).toBe(1);

        //creo socio 
        const resSocio = await request(server)
            .post('/socios')
            .send({
                nombre: 'Tomas Frickmann',
                email: 'tomasfrickmann@gmail.com',
            })
            .expect(201);

        const socioId = resSocio.body.id;

        // hago prestamo
        const resPrestamo = await request(server)
            .post('/prestamos')
            .send({
                libroId: libroId,
                socioId: socioId,
            })
            .expect(201);

        const prestamoId = resPrestamo.body.id;



        await request(server)
            .post(`/prestamos/${prestamoId}/devolucion`)
            .expect(200);

        await request(server)
            .post(`/prestamos/${prestamoId}/devolucion`)
            .expect(409);

    });

    it('prestar sin stock', async () => {
        const server = app.getHttpServer();

        //creo libro
        const resLibro = await request(server)
            .post('/libros')
            .send({
                titulo: 'Rayuela',
                autor: 'Julio Cortázar',
                isbn: '9788437604572',
                categoria: 'novela',
                anio: 1963,
                ejemplares: 1,
            })
            .expect(201);

        const libroId = resLibro.body.id;
        expect(resLibro.body.disponibles).toBe(1);

        //creo socio 
        const resSocio = await request(server)
            .post('/socios')
            .send({
                nombre: 'Tomas Frickmann',
                email: 'tomasfrickmann@gmail.com',
            })
            .expect(201);

        const socioId = resSocio.body.id;

        // hago prestamo
        await request(server)
            .post('/prestamos')
            .send({
                libroId: libroId,
                socioId: socioId,
            })
            .expect(201);
        await request(server)
            .post('/prestamos')
            .send({
                libroId: libroId,
                socioId: socioId,
            })
            .expect(409);


    });
    it('Socion con mas de tres prestamos activos ', async () => {
        const server = app.getHttpServer();

        //creo libro
        const resLibro = await request(server)
            .post('/libros')
            .send({
                titulo: 'Rayuela',
                autor: 'Julio Cortázar',
                isbn: '9788437604572',
                categoria: 'novela',
                anio: 1963,
                ejemplares: 6,
            })
            .expect(201);

        const libroId = resLibro.body.id;


        //creo socio 
        const resSocio = await request(server)
            .post('/socios')
            .send({
                nombre: 'Tomas Frickmann',
                email: 'tomasfrickmann@gmail.com',
            })
            .expect(201);

        const socioId = resSocio.body.id;

        // hago prestamo
        const resPrestamo_1 = await request(server)
            .post('/prestamos')
            .send({
                libroId: libroId,
                socioId: socioId,
            })
            .expect(201);
        const resPrestamo_2 = await request(server)
            .post('/prestamos')
            .send({
                libroId: libroId,
                socioId: socioId,
            })
            .expect(201);
        const resPrestamo_3 = await request(server)
            .post('/prestamos')
            .send({
                libroId: libroId,
                socioId: socioId,
            })
            .expect(201);
        await request(server)
            .post('/prestamos')
            .send({
                libroId: libroId,
                socioId: socioId,
            })
            .expect(409);


    });





    it('libro inexistente', async () => {
        const server = app.getHttpServer();



        //creo socio 
        const resSocio = await request(server)
            .post('/socios')
            .send({
                nombre: 'Tomas Frickmann',
                email: 'tomasfrickmann@gmail.com',
            })
            .expect(201);

        const socioId = resSocio.body.id;

        // hago prestamo
        await request(server)
            .post('/prestamos')
            .send({
                libroId: 1,
                socioId: socioId,
            })
            .expect(404);





    });
    it('socio inexistente', async () => {
        const server = app.getHttpServer();

        //creo libro
        const resLibro = await request(server)
            .post('/libros')
            .send({
                titulo: 'Rayuela',
                autor: 'Julio Cortázar',
                isbn: '9788437604572',
                categoria: 'novela',
                anio: 1963,
                ejemplares: 1,
            })
            .expect(201);

        const libroId = resLibro.body.id;


        // hago prestamo
        const resPrestamo = await request(server)
            .post('/prestamos')
            .send({
                libroId: libroId,
                socioId: 10,
            })
            .expect(404);


    });
    it('prestamo inexistente', async () => {
        const server = app.getHttpServer();

        //creo libro
        const resLibro = await request(server)
            .post('/libros')
            .send({
                titulo: 'Rayuela',
                autor: 'Julio Cortázar',
                isbn: '9788437604572',
                categoria: 'novela',
                anio: 1963,
                ejemplares: 1,
            })
            .expect(201);

        const libroId = resLibro.body.id;


        //creo socio 
        const resSocio = await request(server)
            .post('/socios')
            .send({
                nombre: 'Tomas Frickmann',
                email: 'tomasfrickmann@gmail.com',
            })
            .expect(201);

        const socioId = resSocio.body.id;

        // hago prestamo





        await request(server)
            .post(`/prestamos/${1}/devolucion`)
            .expect(404);


    });

})
/*. Escriba pruebas e2e del flujo completo registrar libro → registrar socio → prestar → devolver,
incluidos los casos de error. Cada archivo e2e debe poder ejecutarse solo y en cualquier orden*/