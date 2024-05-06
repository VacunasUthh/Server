
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class CreateUserDto {

        curp: string;
        image?: string;
        @IsString()
        @IsNotEmpty({
                message: 'El nombre no puede estar vacio',
        })
        name: string;
        @IsString()
        @IsNotEmpty({
                message: 'El apellido paterno no puede estar vacio',
        })
        lastName: string;

        @IsString()
        @IsNotEmpty({
                message: 'El apellido materno no puede estar vacio',
        })
        motherLastName: string;

        @IsString()
        @IsNotEmpty({
                message: 'La fecha de nacimiento no puede estar vacia',
        })
        birthDate: string;

        @IsString()
        @IsNotEmpty({
                message: 'El sexo no puede estar vacio',
        })
        gender: string;
        idWorker: string;
        profession: string;
        cedula: string;
        institution: string;
        position: string;
        address?: {
                cp: string;
                state: string;
                city: string;
                colony: string;
                street: string;
                number: string;
        };
        phone: string;

        @IsString()
        email: string;

        @IsString()
        // puede ser paciente o trabajador
        @IsNotEmpty({
                message: 'El tipo de usuario no puede estar vacio',
        })

        typeUser: string;

        @IsString()
        @IsNotEmpty({
                message: 'La contraseña no puede estar vacia',
        })
        password: string;
}
