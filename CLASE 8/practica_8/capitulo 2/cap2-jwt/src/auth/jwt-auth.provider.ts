import { Injectable } from '@nestjs/common';
import {
    AuthenticationRegistry,
    JwtBearerProvider,
    JwtClaims,
} from '@nestjs/authentication';
import { SociosRepository } from '../socios/socios.repository';
import { Socio } from '../socios/entities/socio.entity';

@Injectable()
export class JwtAuth extends JwtBearerProvider<Socio> {
    constructor(
        private readonly socios: SociosRepository,
        registry: AuthenticationRegistry,
    ) {
        super();
        registry.registerProvider(this);
    }


    validate({ sub }: JwtClaims) {
        return sub ? this.socios.findById(Number(sub)) : null;
    }
}