import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { EmailsService } from './emails.service';

@Controller('emails')
export class EmailsController {
  constructor(private readonly emailsService: EmailsService) {}

  @Post('send-recovery-code')
  async sendRecoveryCode(@Body('email') email: string) {
    try {
      return await this.emailsService.sendRecoveryCode(email);
    } catch (error) {
      throw new HttpException('Error al enviar el correo', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('validate-code')
  async validateRecoveryCode(@Body() body: { email: string, code: string }) {
    const isValid = await this.emailsService.validateRecoveryCode(body.email, body.code);
    if (isValid) {
      return { success: true };
    } else {
      return { success: false };
    }
  }
}
