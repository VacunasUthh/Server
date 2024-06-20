import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ParentsService } from './parents.service';
import { ParentsController } from './parents.controller';
import { User, UserSchema } from '../schemas/user.schema';
import { Children, ChildrenSchema } from '../schemas/children.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Children.name, schema: ChildrenSchema }]),
  ],
  providers: [ParentsService],
  controllers: [ParentsController],
})
export class ParentsModule {}
