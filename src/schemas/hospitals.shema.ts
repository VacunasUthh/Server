import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Address } from './address.schema';

@Schema({
        timestamps: true,
})
export class Hospitals {
        @Prop()
        images?: string[];
        
        @Prop({
                trim: true,
                required: true,
        })
        name: string;
        @Prop({
                trim: true,
                required: true,
        })
        description: string;
        @Prop({
                required: true,
        })
        days: string[];
        @Prop()
        hour: string[];
        @Prop({
                required: true,
        })
        longitude: string;
        @Prop({
                required: true,
        })
        latitude: string;
        @Prop({
                type: Address,
                required: true,
        })
        address: Address;
}

export const HospitalsSchema = SchemaFactory.createForClass(Hospitals);
