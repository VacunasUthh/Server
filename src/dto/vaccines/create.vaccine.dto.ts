import { IsString, IsArray, IsDate, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateVaccineDto {
        images: string[];

        @IsString()
        @IsNotEmpty({
                message: 'El nombre de la vacuna no puede estar vacio',
        })
        name: string;

        @IsString()
        @IsNotEmpty({
                message: 'La descripcion de la vacuna no puede estar vacia',
        })
        description: string;

        @IsArray()
        disease: string[];
        date: string;

        @IsString()
        dose: string;

        @IsArray()
        application: string[];

        @IsArray({})
        @IsOptional()
        town: string[];
        gravity: string;
        @IsArray()
        contraindications: string[];

        @IsArray()
        area: string[];
        appicationDate?: string;
}


