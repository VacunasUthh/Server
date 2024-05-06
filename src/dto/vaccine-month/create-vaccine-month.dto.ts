import { IsArray, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateVaccineMonthDto {
        @IsOptional()
        image: string;

        @IsNotEmpty({
                message: 'El mes es requerido',
        })
        month: number;

        @IsArray()
        vaccines: string[];
}
