import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { configurarApp } from '../src/app.setup';


describe('Ciclo de Refresh Tokens y Logout (Consigna 5)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const modulo = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = modulo.createNestApplication();
    configurarApp(app);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('Login y Emisión de Par de Tokens', () => {
    it('POST /auth/login devuelve tanto accessToken como refreshToken', async () => {
      //  Registramos  socio
      await request(app.getHttpServer())
        .post('/socios')
        .send({
          nombre: 'Usuario Refresh',
          email: 'refresh@uni.edu',
          password: 'password123',
        })
        .expect(201);

      //  log
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'refresh@uni.edu',
          password: 'password123',
        })
        .expect(200);

      expect(res.body.accessToken).toBeDefined();
      expect(res.body.refreshToken).toBeDefined();

    });
  });

  describe('Rotación y Detección de Reutilización (POST /auth/refresh)', () => {
    let refreshTokenInicial: string;
    let socioEmail: string;

    beforeEach(async () => {
      socioEmail = 'rotacion@uni.edu';
      await request(app.getHttpServer())
        .post('/socios')
        .send({
          nombre: 'Usuario Rotacion',
          email: socioEmail,
          password: 'password123',
        })
        .expect(201);

      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: socioEmail,
          password: 'password123',
        })
        .expect(200);

      refreshTokenInicial = loginRes.body.refreshToken;
    });

    it('POST /auth/refresh rota el token: consume el viejo y entrega un nuevo par', async () => {
      const resRefresh = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: refreshTokenInicial })
        .expect(200);

      expect(resRefresh.body.accessToken).toBeDefined();
      expect(resRefresh.body.refreshToken).toBeDefined();

      expect(resRefresh.body.refreshToken).not.toBe(refreshTokenInicial);


      await request(app.getHttpServer())
        .get('/socios')
        .set('Authorization', `Bearer ${resRefresh.body.accessToken}`)
        .expect(200);
    });

    it('reutilizar un refreshToken ya consumido responde 401 y revoca toda la familia de tokens', async () => {

      const res1 = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: refreshTokenInicial })
        .expect(200);

      const nuevoRefreshToken = res1.body.refreshToken;


      await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: refreshTokenInicial })
        .expect(401);


      await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: nuevoRefreshToken })
        .expect(401);
    });

    it('POST /auth/refresh rechaza tokens inexistentes o malformados con 401 o 400', async () => {

      await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: '' })
        .expect(400);


    });
  });

  describe('Cierre de Sesión ', () => {
    let accessToken: string;
    let refreshToken: string;
    let socioId: number;

    beforeEach(async () => {
      const reg = await request(app.getHttpServer())
        .post('/socios')
        .send({
          nombre: 'Usuario Logout',
          email: 'logout@uni.edu',
          password: 'password123',
        })
        .expect(201);

      socioId = reg.body.id;

      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'logout@uni.edu',
          password: 'password123',
        })
        .expect(200);

      accessToken = loginRes.body.accessToken;
      refreshToken = loginRes.body.refreshToken;
    });

    it('POST /auth/logout revoca el refreshToken del dispositivo actual', async () => {

      await request(app.getHttpServer())
        .post('/auth/logout')
        .send({ refreshToken })
        .expect(200);

      // Intentar refrescar con ese token debe responder 401
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken })
        .expect(401);
    });

    it('POST /auth/logout-all es una ruta protegida y rechaza peticiones sin token con 401', async () => {
      await request(app.getHttpServer())
        .post('/auth/logout-all')
        .expect(401);
    });

    it('POST /auth/logout-all revoca todas las sesiones del usuario en todos los dispositivos', async () => {

      const loginDisp2 = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'logout@uni.edu',
          password: 'password123',
        })
        .expect(200);

      const refreshTokenDisp2 = loginDisp2.body.refreshToken;


      await request(app.getHttpServer())
        .post('/auth/logout-all')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);


      await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken })
        .expect(401);

      await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: refreshTokenDisp2 })
        .expect(401);
    });
  });
});

