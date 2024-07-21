import { Module } from '@nestjs/common';
import { VaccinesController } from './vaccines.controller';
import { VaccinesService } from './vaccines.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Vaccine, VaccineSchema } from '../schemas/vaccine.schema';
import {VaccineMonth, VaccineMonthSchema,} from '../schemas/vaccineMonth.schema';

@Module({
        imports: [
                MongooseModule.forFeature([
                        { name: Vaccine.name, schema: VaccineSchema },
                        { name: VaccineMonth.name, schema: VaccineMonthSchema },
                ]),
        ],
        controllers: [VaccinesController],
        providers: [VaccinesService],
        exports: [VaccinesService],
})
export class VaccinesModule {}
