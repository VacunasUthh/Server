import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
        @IsNotEmpty({
                message: 'El correo no puede estar vacio',
        })
        email: string;

        @IsString()
        @IsNotEmpty({
                message: 'La contraseña no puede estar vacia',
        })
        password: string;
}
