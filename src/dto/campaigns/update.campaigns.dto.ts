import { IsArray, IsNotEmpty, IsString } from "class-validator";

export class UpdateCampaignDto {
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
        startdate: string[];

        @IsArray()
        finaldate: string[];

        @IsArray()
        hour: string[];

        @IsArray()
        state: string[];

        @IsArray()
        city: string[];

        @IsArray()
        colony: string[];

        @IsArray()
        vaccines: string[];

        @IsArray()
        sideeffects: string[];

        @IsArray()
        age: string[];

        @IsString()
        assignednurse: string[];
}
