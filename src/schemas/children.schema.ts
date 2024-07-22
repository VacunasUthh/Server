import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
    timestamps: true,
})
export class Children extends Document {
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
    vaccines: string;

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

    @Prop({
        type: String,
        default: null,
    })
    assignedNurse: string | null;

    @Prop({
        type: [{ month: Number, vaccineId: String }],
        default: [],
    })
    appliedVaccines: { month: number, vaccineId: string }[];
}

export const ChildrenSchema = SchemaFactory.createForClass(Children);
