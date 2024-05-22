import { Module } from '@nestjs/common';
import { EmailsService } from './emails.service';
import { EmailsController } from './emails.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
    ]),
],
  providers: [EmailsService],
  controllers: [EmailsController],
  exports: [EmailsService]
})
export class EmailsModule {}
