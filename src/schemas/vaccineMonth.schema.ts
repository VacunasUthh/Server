import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
        timestamps: true,
})
export class VaccineMonth {
        @Prop({
                trim: true,
                required: true,
        })
        image: string;

        @Prop({
                trim: true,
                required: true,
        })
        month: number;

        @Prop({
                trim: true,
                required: true,
        })
        vaccines: string[];
}

export const VaccineMonthSchema = SchemaFactory.createForClass(VaccineMonth);
