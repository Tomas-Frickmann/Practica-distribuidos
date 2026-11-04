import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { configurarApp } from '../src/app.setup';


describe('Seguridad, Login y Rutas Públicas/Protegidas (e2e)', () => {
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


  describe('Rutas Públicas y Registro de Usuarios', () => {
    it('GET /salud es pública y responde 200 sin necesidad de token', () => {
      return request(app.getHttpServer())
        .get('/salud')
        .expect(200);
    });

    it('POST /socios es pública y permite registrar un socio con rol por defecto socio', async () => {
      const res = await request(app.getHttpServer())
        .post('/socios')
        .send({
          nombre: 'Ana Gómez',
          email: 'ana@uni.edu',
          password: 'passwordSegura123',
        })
        .expect(201);

      expect(res.body.id).toBeDefined();
      expect(res.body.email).toBe('ana@uni.edu');
      expect(res.body.rol).toBe('socio');
      expect(res.body.password).toBeUndefined();
    });

    it('POST /socios permite registrar un usuario con rol bibliotecario', async () => {
      const res = await request(app.getHttpServer())
        .post('/socios')
        .send({
          nombre: 'Bibliotecario Jefe',
          email: 'admin@uni.edu',
          password: 'passwordAdmin123',
          rol: 'bibliotecario',
        })
        .expect(201);

      expect(res.body.id).toBeDefined();
      expect(res.body.rol).toBe('bibliotecario');
      expect(res.body.password).toBeUndefined();
    });

    it('POST /socios rechaza contraseña menor a 6 caracteres con 400', async () => {
      await request(app.getHttpServer())
        .post('/socios')
        .send({
          nombre: 'Juan Corto',
          email: 'corto@uni.edu',
          password: '123',
        })
        .expect(400);
    });

    it('POST /socios rechaza rol inválido con 400', async () => {
      await request(app.getHttpServer())
        .post('/socios')
        .send({
          nombre: 'Rol Falso',
          email: 'falso@uni.edu',
          password: 'passwordValida',
          rol: 'superadmin',
        })
        .expect(400);
    });

    it('POST /socios rechaza email duplicado con 409', async () => {
      await request(app.getHttpServer())
        .post('/socios')
        .send({
          nombre: 'Primero',
          email: 'duplicado@uni.edu',
          password: 'password123',
        })
        .expect(201);

      await request(app.getHttpServer())
        .post('/socios')
        .send({
          nombre: 'Segundo',
          email: 'duplicado@uni.edu',
          password: 'otraPassword123',
        })
        .expect(409);
    });
  });


  describe('Endpoint de Login (POST /auth/login)', () => {
    beforeEach(async () => {
      await request(app.getHttpServer())
        .post('/socios')
        .send({
          nombre: 'Carlos Gardel',
          email: 'carlos@tango.com',
          password: 'miContrasenaSecreta',
        })
        .expect(201);
    });

    it('login exitoso: responde 200 y devuelve accessToken con los claims requeridos', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'carlos@tango.com',
          password: 'miContrasenaSecreta',
        })
        .expect(200);

      expect(res.body.accessToken).toBeDefined();
      const token = res.body.accessToken;

      const parts = token.split('.');
      expect(parts).toHaveLength(3);

      const payload = JSON.parse(
        Buffer.from(parts[1], 'base64url').toString('utf8'),
      );

      expect(payload.sub).toBeDefined();
      expect(payload.email).toBe('carlos@tango.com');
      expect(payload.rol).toBe('socio');
      expect(payload.iss).toBe('https://biblio.com');
      expect(payload.aud).toBe('web');
      expect(payload.exp).toBeDefined();
      expect(payload.iat).toBeDefined();
      expect(payload.exp).toBeGreaterThan(payload.iat);

      expect(payload.password).toBeUndefined();
    });

    it('login fallido: responde 401 si la contraseña no coincide', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'carlos@tango.com',
          password: 'contrasenaErronea',
        })
        .expect(401);
    });

    it('login fallido: responde 401 si el usuario no existe', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'fantasma@noexiste.com',
          password: 'passwordCualquiera',
        })
        .expect(401);
    });

    it('login validación: responde 400 si falta el email', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          password: 'miContrasenaSecreta',
        })
        .expect(400);
    });

    it('login validación: responde 400 si el email no es válido', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'no-es-un-email',
          password: 'miContrasenaSecreta',
        })
        .expect(400);
    });

    it('login validación: responde 400 si falta la contraseña', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'carlos@tango.com',
        })
        .expect(400);
    });
  });


  describe('Rutas Protegidas y Validación del Token Bearer', () => {
    let tokenSocio: string;
    let socioId: number;

    beforeEach(async () => {
      const reg = await request(app.getHttpServer())
        .post('/socios')
        .send({
          nombre: 'Socio Protegido',
          email: 'protegido@uni.edu',
          password: 'passwordValida123',
        })
        .expect(201);

      socioId = reg.body.id;

      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'protegido@uni.edu',
          password: 'passwordValida123',
        })
        .expect(200);

      tokenSocio = loginRes.body.accessToken;
    });

    it('rechaza con 401 peticiones sin cabecera Authorization a /socios, /libros y /prestamos', async () => {
      await request(app.getHttpServer()).get('/socios').expect(401);
      await request(app.getHttpServer()).get(`/socios/${socioId}`).expect(401);
      await request(app.getHttpServer()).get('/libros').expect(401);
      await request(app.getHttpServer()).post('/prestamos').send({}).expect(401);
    });

    it('rechaza con 401 cabecera Authorization sin formato Bearer válido', async () => {
      await request(app.getHttpServer())
        .get('/socios')
        .set('Authorization', tokenSocio)
        .expect(401);

      await request(app.getHttpServer())
        .get('/socios')
        .set('Authorization', `Basic ${tokenSocio}`)
        .expect(401);
    });

    it('rechaza con 401 token corrupto, alterado o firma inválida', async () => {
      const tokenModificado = tokenSocio.slice(0, -6) + 'abcdef';
      await request(app.getHttpServer())
        .get('/socios')
        .set('Authorization', `Bearer ${tokenModificado}`)
        .expect(401);
    });

    it('permite acceder a rutas protegidas con un token Bearer válido', async () => {
      const resSocios = await request(app.getHttpServer())
        .get('/socios')
        .set('Authorization', `Bearer ${tokenSocio}`)
        .expect(200);

      expect(Array.isArray(resSocios.body)).toBe(true);
      expect(resSocios.body.length).toBeGreaterThanOrEqual(1);

      const resUnSocio = await request(app.getHttpServer())
        .get(`/socios/${socioId}`)
        .set('Authorization', `Bearer ${tokenSocio}`)
        .expect(200);

      expect(resUnSocio.body.id).toBe(socioId);
      expect(resUnSocio.body.email).toBe('protegido@uni.edu');
    });

    it('garantiza la no filtración de contraseñas en listados y detalles con usuario autenticado', async () => {
      const resListado = await request(app.getHttpServer())
        .get('/socios')
        .set('Authorization', `Bearer ${tokenSocio}`)
        .expect(200);

      for (const socio of resListado.body) {
        expect(socio.password).toBeUndefined();
      }

      const resIndividual = await request(app.getHttpServer())
        .get(`/socios/${socioId}`)
        .set('Authorization', `Bearer ${tokenSocio}`)
        .expect(200);

      expect(resIndividual.body.password).toBeUndefined();
    });
  });

  // =========================================================================
  // BLOQUE 4: AUTORIZACIÓN POR ROL (RBAC) - CONSIGNA 3
  // =========================================================================
  describe('Autorización por Rol y   Préstamos (Consigna 3)', () => {
    let tokenBibliotecario: string;
    let tokenSocioA: string;
    let socioAId: number;
    let tokenSocioB: string;
    let socioBId: number;
    let libroId: number;

    beforeEach(async () => {
      // 1. Registramos y logueamos un bibliotecario
      await request(app.getHttpServer())
        .post('/socios')
        .send({
          nombre: 'Biblio Pro',
          email: 'biblio.rbac@uni.edu',
          password: 'passwordSegura123',
          rol: 'bibliotecario',
        })
        .expect(201);

      const loginBiblio = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'biblio.rbac@uni.edu',
          password: 'passwordSegura123',
        })
        .expect(200);

      tokenBibliotecario = loginBiblio.body.accessToken;

      // 2. Registramos y logueamos al Socio A
      const regA = await request(app.getHttpServer())
        .post('/socios')
        .send({
          nombre: 'Socio A',
          email: 'socioA@uni.edu',
          password: 'passwordSegura123',
        })
        .expect(201);

      socioAId = regA.body.id;

      const loginA = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'socioA@uni.edu',
          password: 'passwordSegura123',
        })
        .expect(200);

      tokenSocioA = loginA.body.accessToken;

      // 3. Registramos y logueamos al Socio B
      const regB = await request(app.getHttpServer())
        .post('/socios')
        .send({
          nombre: 'Socio B',
          email: 'socioB@uni.edu',
          password: 'passwordSegura123',
        })
        .expect(201);

      socioBId = regB.body.id;

      const loginB = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'socioB@uni.edu',
          password: 'passwordSegura123',
        })
        .expect(200);

      tokenSocioB = loginB.body.accessToken;

      // 4. El bibliotecario crea un libro para las pruebas
      const libroRes = await request(app.getHttpServer())
        .post('/libros')
        .set('Authorization', `Bearer ${tokenBibliotecario}`)
        .send({
          titulo: 'Ficciones',
          autor: 'Jorge Luis Borges',
          isbn: '9788420633121',
          categoria: 'cuentos',
          anio: 1944,
          ejemplares: 3,
        })
        .expect(201);

      libroId = libroRes.body.id;
    });


    it('un socio no puede crear libros y recibe 403 Forbidden', async () => {
      await request(app.getHttpServer())
        .post('/libros')
        .set('Authorization', `Bearer ${tokenSocioA}`)
        .send({
          titulo: 'Libro Ilegal',
          autor: 'Anónimo',
          isbn: '9788420633122',
          categoria: 'novela',
          anio: 2020,
          ejemplares: 1,
        })
        .expect(403);
    });


    it('un socio no puede modificar ni eliminar libros y recibe 403 Forbidden', async () => {
      await request(app.getHttpServer())
        .patch(`/libros/${libroId}`)
        .set('Authorization', `Bearer ${tokenSocioA}`)
        .send({ ejemplares: 10 })
        .expect(403);

      await request(app.getHttpServer())
        .delete(`/libros/${libroId}`)
        .set('Authorization', `Bearer ${tokenSocioA}`)
        .expect(403);
    });


    it('tanto socios como bibliotecarios pueden consultar libros (GET /libros)', async () => {
      await request(app.getHttpServer())
        .get('/libros')
        .set('Authorization', `Bearer ${tokenSocioA}`)
        .expect(200);

      await request(app.getHttpServer())
        .get(`/libros/${libroId}`)
        .set('Authorization', `Bearer ${tokenSocioA}`)
        .expect(200);
    });


    it('solo el bibliotecario puede listar préstamos vencidos', async () => {

      await request(app.getHttpServer())
        .get('/prestamos/vencidos')
        .set('Authorization', `Bearer ${tokenSocioA}`)
        .expect(403);


      const res = await request(app.getHttpServer())
        .get('/prestamos/vencidos')
        .set('Authorization', `Bearer ${tokenBibliotecario}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
    });

    //Regla de privacidad: Socio A ve su préstamo; Socio B recibe 404 
    it('un socio solo consulta y devuelve sus propios préstamos; préstamos ajenos responden 404', async () => {

      const prestamoRes = await request(app.getHttpServer())
        .post('/prestamos')
        .set('Authorization', `Bearer ${tokenSocioA}`)
        .send({
          libroId,
        })
        .expect(201);

      const prestamoId = prestamoRes.body.id;


      await request(app.getHttpServer())
        .get(`/prestamos/${prestamoId}`)
        .set('Authorization', `Bearer ${tokenSocioA}`)
        .expect(200);


      await request(app.getHttpServer())
        .get(`/prestamos/${prestamoId}`)
        .set('Authorization', `Bearer ${tokenSocioB}`)
        .expect(404);

      //  Socio B intenta devolver el préstamo de Socio A 
      await request(app.getHttpServer())
        .post(`/prestamos/${prestamoId}/devolucion`)
        .set('Authorization', `Bearer ${tokenSocioB}`)
        .expect(404);

      // 5Socio A puede devolver su propio préstamo 
      await request(app.getHttpServer())
        .post(`/prestamos/${prestamoId}/devolucion`)
        .set('Authorization', `Bearer ${tokenSocioA}`)
        .expect(200);
    });

    // El bibliotecario puede consultar préstamos de cualquier socio
    it('el bibliotecario puede consultar préstamos de cualquier socio', async () => {
      const prestamoRes = await request(app.getHttpServer())
        .post('/prestamos')
        .set('Authorization', `Bearer ${tokenSocioA}`)
        .send({
          libroId,
        })
        .expect(201);

      const prestamoId = prestamoRes.body.id;

      await request(app.getHttpServer())
        .get(`/prestamos/${prestamoId}`)
        .set('Authorization', `Bearer ${tokenBibliotecario}`)
        .expect(200);
    });
  });
});
