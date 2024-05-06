import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateChildrenDto {
        @IsNotEmpty({
                message: 'El id del padre no puede estar vacio',
        })
        parentId: string;
        @IsOptional()
        curp: string;
        @IsOptional()
        image: string;
     
        @IsNotEmpty({
                message: 'El nombre no puede estar vacio',
        })
        name: string;
        
        @IsNotEmpty({
                message: 'El primer apellido no puede estar vacio',
        })
        lastName: string;
        
        @IsNotEmpty({
                message: 'El segundo apellido no puede estar vacio',
        })
        secondLastName: string;

        @IsOptional()
        age: number;

        @IsOptional()
        gender: string;

        @IsOptional()
        height: string;
        
        @IsOptional()
        weight: string;

        @IsOptional()
        imc: string;

        @IsOptional()
        headCircumference: string;

        @IsOptional()
        bloodType: string;

        @IsOptional()
        rhFactor: string;
        
        @IsOptional()
        dateOfBirth: string;
        
        @IsOptional()
        zipCode: string;
        
        @IsOptional()
        state: string;
        
        @IsOptional()
        city: string;
        
        @IsOptional()
        neighborhood: string;
        
        @IsOptional()
        hospital: string;
}