import { Controller, Post, Body } from '@nestjs/common';
import { EmailsService } from './emails.service';

@Controller('emails')
export class EmailsController {
  constructor(private readonly emailsService: EmailsService) {}

  @Post('send-recovery-code')
  async sendRecoveryCode(@Body('email') email: string) {
    return await this.emailsService.sendRecoveryCode(email);
  }
}
