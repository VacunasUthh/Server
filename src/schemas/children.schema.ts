
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
        timestamps: true,
})
export class Children {
        @Prop({
                trim: true,
                required: true,
        })
        parentId: string;
        @Prop()
        curp: string;

        @Prop()
        image: string;
        @Prop({
                trim: true,
                required: true,
        })
        name: string;
        @Prop({
                trim: true,
                required: true,
        })
        lastName: string;
        @Prop({
                trim: true,
                required: true,
        })
        secondLastName: string;
        @Prop()
        age: number;
        @Prop()
        gender: string;

        @Prop()
        height: string;

        @Prop()
        weight: string;
        @Prop()
        imc: string;

        @Prop()
        headCircumference: string;

        @Prop()
        bloodType: string;

        @Prop()
        rhFactor: string;

        @Prop()
        dateOfBirth: string;
        
        @Prop()
        zipCode: string;
        
        @Prop()
        state: string;

        @Prop()
        city: string;

        @Prop()
        neighborhood: string;
        @Prop()
        hospital: string;
}


export const ChildrenSchema = SchemaFactory.createForClass(Children);