
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class UpdateUserDto {

        curp?: string;
        image?: string;
        name?: string;
        lastName?: string;
        motherLastName?: string;
        birthDate?: string;
        gender?: string;
        idWorker?: string;
        profession?: string;
        cedula?: string;
        institution?: string;
        position?: string;
        address?: {
                cp: string;
                state: string;
                city: string;
                colony: string;
                street: string;
                number: string;
        };
        phone?: string;
        email?: string;
        password?: string;
}