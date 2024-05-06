import { Module } from '@nestjs/common';
import { HospitalsController } from './hospitals.controller';
import { HospitalsService } from './hospitals.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Hospitals, HospitalsSchema } from '../schemas/hospitals.shema';

@Module({
        imports: [
                MongooseModule.forFeature([
                        { name: Hospitals.name, schema: HospitalsSchema },
                ]),
        ],
        controllers: [HospitalsController],
        providers: [HospitalsService],
})
export class HospitalsModule {}
