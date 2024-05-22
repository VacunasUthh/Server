import { Module } from '@nestjs/common';
import { EmailsService } from './emails.service';
import { EmailsController } from './emails.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  providers: [EmailsService],
  controllers: [EmailsController],
  exports: [UsersModule]
})
export class EmailsModule {}
