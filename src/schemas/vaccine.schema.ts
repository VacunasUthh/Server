import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';

@Schema({
        timestamps: true,
})
export class Vaccine {
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
        disease: string[];
        @Prop()
        date: string;
        @Prop()
        dose: string;
        @Prop()
        application: string[];
        @Prop()
        town: string[];
        @Prop()
        contraindications: string[];
        @Prop()
        area: string[];
        @Prop()
        gravity: string;
        @Prop()
        appicationDate: string;
}

export const VaccineSchema = SchemaFactory.createForClass(Vaccine);
