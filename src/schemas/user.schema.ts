import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Address } from './address.schema';

@Schema({
        timestamps: true,
})
export class User {
        @Prop({
                trim: true,
                required: true,
        })
        curp: string;

        @Prop({
                trim: true,
        })
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
        motherLastName: string;

        @Prop({
                trim: true,
                required: true,
        })
        birthDate: string;

        @Prop({
                trim: true,
                required: true,
        })
        gender: string;

        @Prop({
                trim: true,
        })
        idWorker: string;

        @Prop({
                trim: true,
        })
        profession: string;

        @Prop({
                trim: true,
        })
        cedula: string;

        @Prop({
                trim: true,
        })
        institution: string;

        @Prop({
                trim: true,
        })
        @Prop({
                default: 'paciente',
        })
        typeUser: string;
        @Prop()
        position: string;

        @Prop({
                type: Address,
        })
        address?: Address;

        @Prop({
                trim: true,
        })
        phone: string;

        @Prop({
                trim: true,
                required: true,
                unique: true,
        })
        email: string;

        @Prop({
                trim: true,
                required: true,
        })
        password: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
