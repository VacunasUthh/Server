
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
        timestamps: true,
})
export class Campaigns {
        @Prop()
        images: string[];
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
        @Prop()
        date: string[];
        @Prop()
        hour: string[];
        @Prop()
        place: string[];
        @Prop()
        vaccines: string[];
        @Prop()
        disease: string[];
        @Prop()
        population: string[];
}


export const CampaignsSchema = SchemaFactory.createForClass(Campaigns);