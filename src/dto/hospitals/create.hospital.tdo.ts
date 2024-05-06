/*
*Foto: Foto.jpg
*Nombre: ISSSTE
*Descripcion: El instituto de…
*Días: [
Lunes,
Martes,
Miércoles,
Jueves,
Viernes
]
*Horario: [
8:00 am – 9:00 am
] 
*Longitud: 21.106297405365524721
*Latitud: -98.42350419585689
*Dirección {
CP: 43050,
Estado: Hidalgo,
Ciudad: Huejutla,
Colonia: La lomita,
Calle: Carr. México -Tampico Km 203,
Numero: S/N
}

*/

import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateHospitalDto {
        @IsOptional()
        images?: string[];
        
        @IsString()
        @IsNotEmpty({
                message: 'El nombre del hospital no puede estar vacio',
        })
        name: string;
        @IsString()
        @IsNotEmpty({
                message: 'La descripcion del hospital no puede estar vacia',
        })
        description: string;
        @IsArray()
        days: string[];
        @IsArray()
        hour: string[];
        @IsString()
        longitude: string;
        @IsString()
        latitude: string;
        address:{
                zipCode: string;
                state: string;
                city: string;
                neighborhood: string;
                street: string;
                number: string;
        }
}