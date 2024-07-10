
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
        startdate: string[];
        @Prop()
        finaldate: string[];
        @Prop()
        hour: string[];
        @Prop()
        state: string[];
        @Prop()
        city: string[];
        @Prop()
        colony: string[];
        @Prop()
        vaccines: string[];
        @Prop()
        sideeffects: string[];
        @Prop()
        age: string[];
        @Prop()
        assignednurse: string[];
}


export const CampaignsSchema = SchemaFactory.createForClass(Campaigns);