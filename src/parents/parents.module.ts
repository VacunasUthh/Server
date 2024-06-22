import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ParentsService } from './parents.service';
import { ParentsController } from './parents.controller';
import { User, UserSchema } from '../schemas/user.schema';
import { Children, ChildrenSchema } from '../schemas/children.schema';
import { Vaccine, VaccineSchema } from '../schemas/vaccine.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Children.name, schema: ChildrenSchema }]),
    MongooseModule.forFeature([{ name: Vaccine.name, schema: VaccineSchema }]),
  ],
  providers: [ParentsService],
  controllers: [ParentsController],
})
export class ParentsModule {}
