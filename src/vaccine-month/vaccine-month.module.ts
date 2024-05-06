import { Module } from '@nestjs/common';
import { VaccineMonthService } from './vaccine-month.service';
import { VaccineMonthController } from './vaccine-month.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
        VaccineMonth,
        VaccineMonthSchema,
} from '../schemas/vaccineMonth.schema';
import { Vaccine, VaccineSchema } from 'src/schemas/vaccine.schema';

@Module({
        imports: [
                MongooseModule.forFeature([
                        { name: VaccineMonth.name, schema: VaccineMonthSchema },
                        //injctar otro servicio en el modulo
                        { name: Vaccine.name, schema: VaccineSchema },
                ]),
        ],
        controllers: [VaccineMonthController],
        providers: [VaccineMonthService],
})
export class VaccineMonthModule {}
