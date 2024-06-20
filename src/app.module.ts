import { ParentsModule } from './parents/parents.module';
import { Module, MiddlewareConsumer, NestModule, RequestMethod } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VaccinesModule } from './vaccines/vaccines.module';
import { UsersModule } from './users/users.module';
import { CampaignsModule } from './campaigns/campaigns.module';
import { ChildrenModule } from './children/children.module';
import { HospitalsModule } from './hospitals/hospitals.module';
import { AuthModule } from './auth/auth.module';
import { VaccineMonthModule } from './vaccine-month/vaccine-month.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { EmailsModule } from './emails/emails.module';
import { CorsMiddleware } from './cors.middleware';

@Module({
  imports: [
    ParentsModule,
    MongooseModule.forRoot(
      'mongodb+srv://vacunas:W0j3k2szYeMztEFM@clustervaccination.nny0wi6.mongodb.net/vaccinemanager',
    ),
    VaccinesModule,
    UsersModule,
    CampaignsModule,
    ChildrenModule,
    HospitalsModule,
    AuthModule,
    VaccineMonthModule,
    CloudinaryModule,
    EmailsModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CorsMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
