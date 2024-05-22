import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schemas/user.schema';

@Injectable()
export class EmailsService {
  private transporter: Transporter;
  private email: string = 'emailvacunas@gmail.com';
  private password: string = 'eipp mzzh yuko iygs';
  private generatedCodes: Map<string, string> = new Map(); 

  constructor(@InjectModel('User') private readonly userModel: Model<User>) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.email,
        pass: this.password,
      },
    });
    setInterval(() => {
      this.clearExpiredCodes();
    }, 5 * 60 * 1000); 
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
    const user = await this.findOneByEmail(to);
    if (!user) {
      throw new Error('El correo electrónico no está registrado en nuestra base de datos.');
    }

    const code = this.generateRandomCode(4); 

    this.generatedCodes.set(to, code); 

    const mailOptions = {
      from: `"Sistema de vacunas" <${this.email}>`,
      to,
      subject: 'Recuperación de contraseña, El código expira en un máximo de 5 minutos',
      text: `Tu código de recuperación es: ${code}`,
      html: `<p>Tu código de recuperación es: <strong>${code}</strong></p>`,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Correo enviado: %s', info.messageId);
      return { success: true };
    } catch (error) {
      console.error('Error al enviar correo:', error);
      throw error;
    }
  }

  private clearExpiredCodes() {
    const currentTime = Date.now();
    for (const [email, timestamp] of this.generatedCodes.entries()) {
      const codeTime = parseInt(timestamp); 
      if (currentTime - codeTime > 5 * 60 * 1000) { 
        this.generatedCodes.delete(email); 
      }
    }
  }

  async findOneByEmail(email: string) {
    return await this.userModel.findOne({ email });
  }
  
}
