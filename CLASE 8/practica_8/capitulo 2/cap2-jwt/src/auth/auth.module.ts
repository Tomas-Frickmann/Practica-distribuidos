import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SociosModule } from '../socios/socios.module';

@Module({
    imports: [SociosModule],
    controllers: [AuthController],
    providers: [AuthService],
})
export class AuthModule { }