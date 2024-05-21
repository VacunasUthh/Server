import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailsService {
  private transporter: Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: 'emailvacunas@gmail.com',
        pass: 'eipp mzzh yuko iygs',
      },
    });
  }

  private generateRandomCode(length: number): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  async sendRecoveryCode(to: string) {
    const code = this.generateRandomCode(4); // Generar un código de 4 caracteres

    const mailOptions = {
      from: `"Tu Nombre" <${this.configService.get<string>('EMAIL_USER')}>`,
      to,
      subject: 'Recuperación de contraseña',
      text: `Tu código de recuperación es: ${code}`,
      html: `<p>Tu código de recuperación es: <strong>${code}</strong></p>`,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Correo enviado: %s', info.messageId);
      // Aquí podrías almacenar el código en una base de datos o caché
      return { success: true, code }; // Retorna el código para propósitos de almacenamiento
    } catch (error) {
      console.error('Error al enviar correo:', error);
      throw error;
    }
  }
}
