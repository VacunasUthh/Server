import { Body, Controller, Post } from '@nestjs/common';
import { LoginDto } from '../dto/login/login.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
        constructor(private readonly authService: AuthService) {}

        @Post('login')
        async login(@Body() LoginDto: LoginDto) {
                return this.authService.login(LoginDto);
        }
}
