import { Module } from '@nestjs/common';
import { LibrosModule } from './libros/libros.module';
import { PrestamosModule } from './prestamos/prestamos.module';
import { SaludController } from './salud/salud.controller';
import { SociosModule } from './socios/socios.module';
import { AuthenticationModule } from '@nestjs/authentication'
import { JwtAuth } from './auth/jwt-auth.provider';
import { AuthModule } from './auth/auth.module';
import { RolesGuard } from './auth/guards/roles.guard';

@Module({
  imports: [LibrosModule, SociosModule, AuthModule, PrestamosModule,
    AuthenticationModule.forRoot({
      accessToken: {
        key: 'clave_secreta_super_segura_de_al_menos_32_bytes_de_largo_123',
        issuer: 'https://biblio.com',
        audience: 'web',
        ttl: '15m',
      }
    })
  ],
  controllers: [SaludController],
  providers: [
    JwtAuth,
    RolesGuard,
  ],
})
export class AppModule { }
