import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) { }

    canActivate(contexto: ExecutionContext): boolean {
        const roles = this.reflector.getAllAndOverride<string[]>(
            "roles",
            [contexto.getHandler(), contexto.getClass()]
        );

        if (!roles) {
            return true;
        }

        const request = contexto.switchToHttp().getRequest();
        const usuario = request.user;

        if (!usuario || !roles.includes(usuario.rol)) {
            throw new ForbiddenException('No tenes permisos');
        }

        return true;
    }
}
