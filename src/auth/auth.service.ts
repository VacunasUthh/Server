import { Injectable, UnauthorizedException, ForbiddenException  } from '@nestjs/common';
import { LoginDto } from '../dto/login/login.dto';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
        constructor(private readonly userService: UsersService) {}

        async login({ email, password }: LoginDto) {
                const user = await this.userService.findOneByEmail(
                        email.toLocaleLowerCase().trim(),
                );
                if (!user) {
                        throw new UnauthorizedException(
                                'Las credenciales no son válidas.',
                        );
                }

                const isValid = await bcrypt.compare(
                        password.trim(),
                        user.password,
                );

                if (!isValid) {
                        throw new UnauthorizedException(
                                'Las credenciales no son válidas.',
                        );
                }
                
                delete user.password;
                return user;
        }

        async loginWeb(email: string, password: string) {
                const user = await this.userService.findOneByEmail(
                    email.toLocaleLowerCase().trim(),
                );
                if (!user) {
                    throw new UnauthorizedException('Las credenciales no son válidas.');
                }
        
                const isValid = await bcrypt.compare(password.trim(), user.password);
        
                if (!isValid) {
                    throw new UnauthorizedException('Las credenciales no son válidas.');
                }
        
                if (user.typeUser !== 'trabajador') {
                    throw new ForbiddenException('Acceso denegado para pacientes.');
                }
        
                delete user.password;
                return user;
            }
}
