import { Body, Controller, Post } from '@nestjs/common';
import { LoginDto } from '../dto/login/login.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
        constructor(private readonly authService: AuthService) { }

        @Post('login')
        async login(@Body() LoginDto: LoginDto) {
                return this.authService.login(LoginDto);
        }
        
        @Post('loginWeb')
        async loginWeb(@Body() body: { email: string, password: string }) {
                const { email, password } = body;
                return this.authService.loginWeb(email, password);
        }

        @Post('message')
        async sendMessage(@Body() message: { email: string, password: string }) {
            // Devuelve un mensaje de confirmación
            return { message: 'Mensaje recibido correctamente' };
        }
}
