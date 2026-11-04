import { Test } from "@nestjs/testing";
import { LibrosService } from "../libros/libros.service";
import { SociosService } from "../socios/socios.service";
import { PrestamosRepository } from "./prestamos.repository";
import { PrestamosService } from "./prestamos.service";
import { NotFoundException, ConflictException } from "@nestjs/common";

describe('Prestamos Service', () => {

    let service: PrestamosService;
    let repoMock: any;
    let librosServiceMock: any;
    let sociosServiceMock: any;


    beforeEach(async () => {
        jest.useFakeTimers();
        repoMock = {
            create: jest.fn(),
            findAll: jest.fn(),
            findById: jest.fn(),
            findActivosPorSocio: jest.fn(),
            save: jest.fn((p) => p),
        };

        librosServiceMock = {
            findOne: jest.fn(),
            ajustarDisponibles: jest.fn(),
        };

        sociosServiceMock = {
            findOne: jest.fn(),
        };


        const modulo = await Test.createTestingModule({
            providers: [
                PrestamosService,
                { provide: PrestamosRepository, useValue: repoMock },
                { provide: LibrosService, useValue: librosServiceMock },
                { provide: SociosService, useValue: sociosServiceMock },
            ],
        }).compile();


        service = modulo.get(PrestamosService);
    });
    afterAll(async () => {
        jest.useRealTimers()
    });
    describe('Prestamos', () => {
        it("socio inexistente", () => {
            librosServiceMock.findOne.mockReturnValue({
                id: 1,
                titulo: 'Algo',
                disponibles: 2,

            })
            sociosServiceMock.findOne.mockImplementation(() => { throw new NotFoundException('El socio no esta') })
            expect(() => {
                service.prestar({ libroId: 1, socioId: 10 })



            }).toThrow(NotFoundException)


        })
        it("libro inexistente", () => {
            sociosServiceMock.findOne.mockReturnValue({
                id: 10,
                nombre: 'Tomas',
                mail: 'tomas@getMaxListeners.com',

            })
            librosServiceMock.findOne.mockImplementation(() => { throw new NotFoundException('El libro  no esta') })
            expect(() => {
                service.prestar({ libroId: 1, socioId: 10 })



            }).toThrow(NotFoundException)


        })
        //Un socio no puede tener más de 3 préstamos activos a la vez (409).
        it('no permite prestar si el socio ya tiene 3 préstamos activos', () => {

            librosServiceMock.findOne.mockReturnValue({
                id: 1,
                disponibles: 5,
            });
            sociosServiceMock.findOne.mockReturnValue({ id: 10 });


            repoMock.findActivosPorSocio.mockReturnValue([
                { id: 101 },
                { id: 102 },
                { id: 103 },
            ]);


            expect(() => {
                service.prestar({ libroId: 1, socioId: 10 });
            }).toThrow(ConflictException);
        });
        it(' permite prestar si el socio  tiene 2 o menos', () => {

            librosServiceMock.findOne.mockReturnValue({
                id: 1,
                disponibles: 5,
            });
            sociosServiceMock.findOne.mockReturnValue({ id: 10 });


            repoMock.findActivosPorSocio.mockReturnValue([
                { id: 101 },
                { id: 102 },

            ]);


            expect(() => {
                service.prestar({ libroId: 1, socioId: 10 });
            }).not.toThrow(ConflictException);
        });

        it(' permite prestar si el libro tiene stock', () => {

            librosServiceMock.findOne.mockReturnValue({
                id: 1,
                disponibles: 2,
            });
            sociosServiceMock.findOne.mockReturnValue({ id: 10 });


            repoMock.findActivosPorSocio.mockReturnValue([
                { id: 101 },
                { id: 102 },

            ]);


            expect(() => {
                service.prestar({ libroId: 1, socioId: 10 });
            }).not.toThrow(ConflictException);
        });
        it(' permite prestar si el libro tiene 1', () => {

            librosServiceMock.findOne.mockReturnValue({
                id: 1,
                disponibles: 1,
            });
            sociosServiceMock.findOne.mockReturnValue({ id: 10 });


            repoMock.findActivosPorSocio.mockReturnValue([
                { id: 101 },
                { id: 102 },

            ]);


            expect(() => {
                service.prestar({ libroId: 1, socioId: 10 });
            }).not.toThrow(ConflictException);
        });
        it(' no permite prestar si el libro no  tiene stock', () => {

            librosServiceMock.findOne.mockReturnValue({
                id: 1,
                disponibles: 0,
            });
            sociosServiceMock.findOne.mockReturnValue({ id: 10 });


            repoMock.findActivosPorSocio.mockReturnValue([
                { id: 101 },
                { id: 102 },

            ]);


            expect(() => {
                service.prestar({ libroId: 1, socioId: 10 });
            }).toThrow(ConflictException);
        });

        it(' dias de prestamo 14 ', () => {
            const fechaInicio = new Date('2026-07-10T10:00:00.000Z');
            jest.setSystemTime(fechaInicio);

            librosServiceMock.findOne.mockReturnValue({
                id: 1,
                disponibles: 6,
            });
            sociosServiceMock.findOne.mockReturnValue({ id: 10 });


            repoMock.findActivosPorSocio.mockReturnValue([
                { id: 101 },
                { id: 102 },

            ]);
            repoMock.create.mockImplementation((datos: any) => ({ id: 1, ...datos }))

            const respuesta = service.prestar({ libroId: 1, socioId: 10 })
            expect(respuesta.vencimiento).toBe('2026-07-24T10:00:00.000Z');
            expect(respuesta.prestadoEn).toBe('2026-07-10T10:00:00.000Z');
        });
        it(' dias de prestamo !=14 ', () => {
            const fechaInicio = new Date('2026-07-10T10:00:00.000Z');
            jest.setSystemTime(fechaInicio);

            librosServiceMock.findOne.mockReturnValue({
                id: 1,
                disponibles: 6,
            });
            sociosServiceMock.findOne.mockReturnValue({ id: 10 });


            repoMock.findActivosPorSocio.mockReturnValue([
                { id: 101 },
                { id: 102 },

            ]);
            repoMock.create.mockImplementation((datos: any) => ({ id: 1, ...datos }))

            const respuesta = service.prestar({ libroId: 1, socioId: 10, dias: 20 })
            expect(respuesta.vencimiento).toBe('2026-07-30T10:00:00.000Z');
            expect(respuesta.prestadoEn).toBe('2026-07-10T10:00:00.000Z');
        });
        it(' dias de prestamo <14 ', () => {
            const fechaInicio = new Date('2026-07-10T10:00:00.000Z');
            jest.setSystemTime(fechaInicio);

            librosServiceMock.findOne.mockReturnValue({
                id: 1,
                disponibles: 6,
            });
            sociosServiceMock.findOne.mockReturnValue({ id: 10 });


            repoMock.findActivosPorSocio.mockReturnValue([
                { id: 101 },
                { id: 102 },

            ]);
            repoMock.create.mockImplementation((datos: any) => ({ id: 1, ...datos }))

            const respuesta = service.prestar({ libroId: 1, socioId: 10, dias: 7 })
            expect(respuesta.vencimiento).toBe('2026-07-17T10:00:00.000Z');
            expect(respuesta.prestadoEn).toBe('2026-07-10T10:00:00.000Z');
        });






        //Prestar descuenta un ejemplar disponible; devolver lo repone.
        it('al prestar, descuenta un ejemplar disponible del libro', () => {

            librosServiceMock.findOne.mockReturnValue({
                id: 1,
                disponibles: 2,
            });
            sociosServiceMock.findOne.mockReturnValue({ id: 10 });
            repoMock.findActivosPorSocio.mockReturnValue([]);
            repoMock.create.mockReturnValue({ id: 100 });


            service.prestar({ libroId: 1, socioId: 10 });


            expect(librosServiceMock.ajustarDisponibles).toHaveBeenCalledWith(1, -1);
        });


    });

    describe('obtener', () => {


        it('lanza NotFoundException si el préstamo no existe', () => {
            repoMock.findById.mockReturnValue(undefined);

            expect(() => service.obtener(999)).toThrow(NotFoundException);
        });


    });
    describe('devolver', () => {

        it('lanza NotFoundException si se intenta devolver un préstamo inexistente', () => {
            repoMock.findById.mockReturnValue(undefined);

            expect(() => service.devolver(999)).toThrow(NotFoundException);
        });

        it('Devolver un préstamo ya devuelto es un error', () => {
            repoMock.findById.mockReturnValue({
                id: 1,
                libroId: 1,
                socioId: 1,
                devueltoEn: Date.now,

            });

            expect(() => service.devolver(1)).toThrow(ConflictException);
        });

        it('Devolver con atraso de mas de un dia exacto ', () => {
            repoMock.findById.mockReturnValue({
                id: 1,
                libroId: 1,
                socioId: 1,

                prestadoEn: '2026-03-01T10:00:00.000Z', // ISO 8601
                vencimiento: '2026-03-15T10:00:00.000Z', // ISO 8601

                devueltoEn: null,
                multa: 0

            });
            jest.setSystemTime(new Date('2026-03-17T10:00:00.000Z'));
            const resultado = service.devolver(1);
            expect(resultado.multa).toBe(200);
        });

        it('Devolver con atraso de mas de un dia y fracc ', () => {
            repoMock.findById.mockReturnValue({
                id: 1,
                libroId: 1,
                socioId: 1,

                prestadoEn: '2026-03-01T10:00:00.000Z', // ISO 8601
                vencimiento: '2026-03-15T10:00:00.000Z', // ISO 8601

                devueltoEn: null,
                multa: 0

            });
            jest.setSystemTime(new Date('2026-03-17T10:00:00.001Z'));
            const resultado = service.devolver(1);
            expect(resultado.multa).toBe(300);
        });
        it('Devolver con atraso  fracc ', () => {
            repoMock.findById.mockReturnValue({
                id: 1,
                libroId: 1,
                socioId: 1,

                prestadoEn: '2026-03-01T10:00:00.000Z', // ISO 8601
                vencimiento: '2026-03-15T10:00:00.000Z', // ISO 8601

                devueltoEn: null,
                multa: 0

            });
            jest.setSystemTime(new Date('2026-03-15T10:00:00.001Z'));
            const resultado = service.devolver(1);
            expect(resultado.multa).toBe(100);
        });
        it('Devolver dia justo  ', () => {
            repoMock.findById.mockReturnValue({
                id: 1,
                libroId: 1,
                socioId: 1,

                prestadoEn: '2026-03-01T10:00:00.000Z', // ISO 8601
                vencimiento: '2026-03-15T10:00:00.000Z', // ISO 8601

                devueltoEn: null,
                multa: 0

            });
            jest.setSystemTime(new Date('2026-03-15T10:00:00.000Z'));
            const resultado = service.devolver(1);
            expect(resultado.multa).toBe(0);
        });
        it('Devolver sin atraso   ', () => {
            repoMock.findById.mockReturnValue({
                id: 1,
                libroId: 1,
                socioId: 1,

                prestadoEn: '2026-03-01T10:00:00.000Z', // ISO 8601
                vencimiento: '2026-03-15T10:00:00.000Z', // ISO 8601

                devueltoEn: null,
                multa: 0

            });
            jest.setSystemTime(new Date('2026-03-10T10:00:00.001Z'));
            const resultado = service.devolver(1);
            expect(resultado.multa).toBe(0);
        });

        it('al devolver, repone un ejemplar disponible del libro', () => {

            repoMock.findById.mockReturnValue({
                id: 1,
                libroId: 5,
                socioId: 10,
                devueltoEn: null,
                vencimiento: '2026-03-15T10:00:00.000Z',
                multa: 0,
            });


            service.devolver(1);


            expect(librosServiceMock.ajustarDisponibles).toHaveBeenCalledWith(5, 1);
        });

    });

});


