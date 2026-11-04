import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { CurrentUser, Public } from '@nestjs/authentication';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dt';
import { Socio } from '../socios/entities/socio.entity';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Public()
    @HttpCode(HttpStatus.OK)
    @Post('login')
    login(@Body() dto: LoginDto) {
        return this.authService.login(dto);
    }
    @Public()
    @HttpCode(HttpStatus.OK)
    @Post('refresh')
    refresh(@Body() dto: RefreshDto) {
        return this.authService.refresh(dto.refreshToken);
    }

    @Public()
    @HttpCode(HttpStatus.OK)
    @Post('logout')
    logout(@Body() dto: RefreshDto) {
        return this.authService.logout(dto.refreshToken);
    }

    @HttpCode(HttpStatus.OK)
    @Post('logout-all')
    logout_all(@CurrentUser() usuario: Socio) {
        return this.authService.logoutAll(usuario.id);
    }

}
