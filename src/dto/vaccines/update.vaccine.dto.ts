import { IsNotEmpty, IsString } from "class-validator";

export class UpdateVaccineDto {
        images?: string[];

        @IsString()
        @IsNotEmpty({
                message: 'El nombre de la vacuna no puede estar vacio'
        })
        name?: string;

        description?: string;
        disease?: string[];
        date?: string;
        dose?: string;
        application?: string[];
        town?: string[];
        contraindications?: string[];
        area?: string[];
        appicationDate?: string;
}
