import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { configurarApp } from '../src/app.setup';

describe('Libros (e2e)', () => {
  let app: INestApplication<App>;
  let token: string;

  beforeEach(async () => {
    const modulo = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = modulo.createNestApplication();
    configurarApp(app);
    await app.init();

    // Crear un usuario bibliotecario y autenticarse
    await request(app.getHttpServer())
      .post('/socios')
      .send({
        nombre: 'Bibliotecario Libros',
        email: 'biblio@uni.edu',
        password: 'passwordSegura123',
        rol: 'bibliotecario',
      })
      .expect(201);

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'biblio@uni.edu',
        password: 'passwordSegura123',
      })
      .expect(200);

    token = loginRes.body.accessToken;
  });

  afterEach(async () => {
    await app.close();
  });

  it('POST /libros crea un libro y GET /libros/:id lo devuelve', async () => {
    const { body } = await request(app.getHttpServer())
      .post('/libros')
      .set('Authorization', `Bearer ${token}`)
      .send({
        titulo: 'Rayuela',
        autor: 'Julio Cortázar',
        isbn: '9788437604572',
        categoria: 'novela',
        anio: 1963,
        ejemplares: 2,
      })
      .expect(201);

    await request(app.getHttpServer())
      .get(`/libros/${body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });

  it('rechaza un libro inválido con 400', () => {
    return request(app.getHttpServer())
      .post('/libros')
      .set('Authorization', `Bearer ${token}`)
      .send({ titulo: 'X' })
      .expect(400);
  });
});
