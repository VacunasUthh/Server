import { Injectable, NotFoundException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schemas/user.schema';
import { VaccineMonth } from '../schemas/vaccineMonth.schema';
import { Children} from '../schemas/children.schema'

@Injectable()
export class EmailsService {
  private transporter: Transporter;
  private email: string = 'emailvacunas@gmail.com';
  private password: string = 'nlee bebk dsnh whke';
  private generatedCodes: Map<string, { code: string, timestamp: number }> = new Map(); 

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(VaccineMonth.name) private vaccineMonthModel: Model<VaccineMonth>,
    @InjectModel(Children.name) private childrenModel: Model<Children> // Inyecta el modelo de VaccineMonth
  ) {
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
    const characters = '0123456789';
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
      throw new NotFoundException('El correo electrónico no está registrado.');
    }

    const code = this.generateRandomCode(4); 
    const timestamp = Date.now();

    this.generatedCodes.set(to, { code, timestamp }); 

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
    for (const [email, { code, timestamp }] of this.generatedCodes.entries()) {
      if (currentTime - timestamp > 5 * 60 * 1000) { 
        this.generatedCodes.delete(email); 
      }
    }
  }

  async validateRecoveryCode(email: string, code: string): Promise<{ isValid: boolean, receivedEmail: string, receivedCode: string }> {
    const record = this.generatedCodes.get(email);
    const isValid = record && record.code === code;
    if (isValid) {
      this.generatedCodes.delete(email);
    }
    return { isValid, receivedEmail: email, receivedCode: code };
  }

  async findOneByEmail(email: string) {
    return await this.userModel.findOne({ email });
  }


  async sendNotificationEmail(to: string) {
    const user = await this.findOneByEmail(to);
    if (!user) {
      throw new NotFoundException('El correo electrónico no está registrado.');
    }

    const children = await this.childrenModel.find({ parentId: user._id }).exec();
    if (!children || children.length === 0) {
      throw new NotFoundException('No se encontraron hijos para este usuario.');
    }

    const vaccineMonths = await this.vaccineMonthModel.find().lean().exec();

    const notifications = [];

    children.forEach(child => {
      const ageInMonths = child.age * 12; // Convertir la edad de años a meses
      const childVaccines = child.vaccines || []; // Asumiendo que las vacunas del niño están almacenadas en un campo 'vaccines'

      vaccineMonths.forEach(vaccineMonth => {
        if (ageInMonths >= vaccineMonth.month) {
          const missingVaccines = vaccineMonth.vaccines.filter(vaccine => !childVaccines.includes(vaccine));
          if (missingVaccines.length > 0) {
            notifications.push({
              childName: child.name,
              missingVaccines,
            });
          }
        }
      });
    });

    if (notifications.length === 0) {
      console.log('No hay vacunas faltantes para notificar.');
      return { success: false, message: 'No hay vacunas faltantes para notificar.' };
    }

    const mailOptions = {
      from: `"Sistema de vacunas" <${this.email}>`,
      to,
      subject: 'Notificación de vacunas faltantes',
      text: this.buildNotificationText(notifications),
      html: this.buildNotificationHtml(notifications),
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

  private buildNotificationText(notifications: any[]): string {
    let text = 'Notificación de vacunas faltantes:\n\n';
    notifications.forEach(notification => {
      text += `Hijo: ${notification.childName}\n`;
      text += `Vacunas faltantes: ${notification.missingVaccines.join(', ')}\n\n`;
    });
    return text;
  }

  private buildNotificationHtml(notifications: any[]): string {
    let html = '<h1>Notificación de vacunas faltantes:</h1>';
    notifications.forEach(notification => {
      html += `<h2>Hijo: ${notification.childName}</h2>`;
      html += `<p>Vacunas faltantes: ${notification.missingVaccines.join(', ')}</p>`;
    });
    return html;
  }
}
