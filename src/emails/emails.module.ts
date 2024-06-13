import { Module } from '@nestjs/common';
import { EmailsService } from './emails.service';
import { EmailsController } from './emails.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../schemas/user.schema';
import { Children, ChildrenSchema } from '../schemas/children.schema'; 
import { VaccineMonth, VaccineMonthSchema } from '../schemas/vaccineMonth.schema'; 
import { Vaccine, VaccineSchema } from '../schemas/vaccine.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Children.name, schema: ChildrenSchema }, 
      { name: VaccineMonth.name, schema: VaccineMonthSchema }, 
      { name: Vaccine.name, schema: VaccineSchema },
    ]),
  ],
  providers: [EmailsService],
  controllers: [EmailsController],
  exports: [EmailsService],
})
export class EmailsModule {}
