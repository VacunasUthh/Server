import { Module } from '@nestjs/common';
import { VaccinesModule } from './vaccines/vaccines.module';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { CampaignsModule } from './campaigns/campaigns.module';
import { ChildrenModule } from './children/children.module';
import { HospitalsModule } from './hospitals/hospitals.module';
import { AuthModule } from './auth/auth.module';
import { VaccineMonthModule } from './vaccine-month/vaccine-month.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';

//mongodb://localhost:27017/vaccinemanager
//mongodb+srv://vacunas:BlmpV4WEQaw1gUxI@clustervaccination.nny0wi6.mongodb.net/vaccinemanager
@Module({
        imports: [
                MongooseModule.forRoot(
                        'mongodb+srv://vacunas:W0j3k2szYeMztEFM@clustervaccination.nny0wi6.mongodb.net/',
                ),
                VaccinesModule,
                UsersModule,
                CampaignsModule,
                ChildrenModule,
                HospitalsModule,
                AuthModule,
                VaccineMonthModule,
                CloudinaryModule,
        ],
})
export class AppModule {}
