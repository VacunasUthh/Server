import { IsArray, IsOptional } from 'class-validator';

export class UpdateVaccineMonthDto {
        @IsOptional()
        image: string;

        @IsOptional()
        month: number;

        @IsArray()
        @IsOptional()
        vaccines: string[];
}
