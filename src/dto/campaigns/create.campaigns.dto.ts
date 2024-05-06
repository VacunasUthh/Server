import { IsArray, IsNotEmpty, IsString } from "class-validator";

export class CreateCampaignDto {
        images: string[];

        @IsString()
        @IsNotEmpty({
                message: 'El nombre de la campaña no puede estar vacio',
        })
        name: string;

        @IsString()
        @IsNotEmpty({
                message: 'La descripcion de la campaña no puede estar vacia',
        })
        description: string;

        @IsArray()
        date: string[];

        @IsArray()
        hour: string[];

        @IsArray()
        place: string[];

        @IsArray()
        vaccines: string[];

        @IsArray()
        disease: string[];

        @IsArray()
        population: string[];
}
