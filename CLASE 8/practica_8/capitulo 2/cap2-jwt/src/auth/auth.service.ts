import {
    ConflictException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';


import { PasswordHasher, TokenService } from '@nestjs/authentication'
import { LoginDto } from './dto/login.dto';
import { SociosRepository } from '../socios/socios.repository';
import { RefreshDto } from './dto/refresh.dt';
@Injectable()
export class AuthService {
    constructor(private readonly repo: SociosRepository, private readonly hasher: PasswordHasher, private readonly token: TokenService) { }

    async login(dto: LoginDto) {
        const socio = this.repo.findByEmail(dto.email)
        if (!socio)
            throw new UnauthorizedException('Credenciales inválidas')


        const ok = await this.hasher.verify(dto.password, socio.password);
        if (!ok)

            throw new UnauthorizedException('Credenciales inválidas');

        const par = await this.token.issue(String(socio.id), {
            claims: {
                email: socio.email,
                rol: socio.rol,
            },
        });
        return { accessToken: par.accessToken, refreshToken: par.refreshToken };

    }
    async refresh(refreshToken: string) {
        try {
            const nuevo = await this.token.refresh(refreshToken);
            return {
                accessToken: nuevo.accessToken,
                refreshToken: nuevo.refreshToken,
            };
        } catch (error) {
            throw new UnauthorizedException('Refresh token inválido o reutilizado');
        }
    }
    async logout(refreshToken: string) {
        await this.token.revoke(refreshToken);
        return { mensaje: 'Sesión cerrada ' };
    }
    async logoutAll(socioId: number) {
        await this.token.revokeAll(String(socioId));
        return { mensaje: 'Todas las sesiones fueron cerradas' };
    }

}
