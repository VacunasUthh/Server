import { Injectable, NotFoundException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schemas/user.schema';
import { VaccineMonth } from '../schemas/vaccineMonth.schema';
import { Vaccine } from '../schemas/vaccine.schema';
import { Children } from '../schemas/children.schema';

@Injectable()
export class EmailsService {
  private transporter: Transporter;
  private email: string = 'emailvacunas@gmail.com';
  private password: string = 'nlee bebk dsnh whke';
  private generatedCodes: Map<string, { code: string, timestamp: number }> = new Map(); 

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(VaccineMonth.name) private vaccineMonthModel: Model<VaccineMonth>,
    @InjectModel(Children.name) private childrenModel: Model<Children>,
    @InjectModel(Vaccine.name) private vaccineModel: Model<Vaccine> 
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
    const notifications = {};

    for (const child of children) {
      const ageInMonths = child.age * 12; 
      const childVaccines = child.vaccines || []; 

      for (const vaccineMonth of vaccineMonths) {
        if (ageInMonths >= vaccineMonth.month) {
          const missingVaccines = vaccineMonth.vaccines.filter(vaccine => !childVaccines.includes(vaccine));
          if (missingVaccines.length > 0) {
            if (!notifications[child.name]) {
              notifications[child.name] = [];
            }
            notifications[child.name].push(...missingVaccines);
          }
        }
      }
    }

    for (const childName in notifications) {
      notifications[childName] = [...new Set(notifications[childName])];
    }

    if (Object.keys(notifications).length === 0) {
      console.log('No hay vacunas faltantes para notificar.');
      return { success: false, message: 'No hay vacunas faltantes para notificar.' };
    }

    const vaccineIds = new Set();
    for (const childName in notifications) {
      notifications[childName].forEach(vaccineId => vaccineIds.add(vaccineId));
    }
    const vaccines = await this.vaccineModel.find({ _id: { $in: Array.from(vaccineIds) } }).lean().exec();
    const vaccineMap = vaccines.reduce((map, vaccine) => {
      map[vaccine._id.toString()] = vaccine.name; 
      return map;
    }, {});

    const mailOptions = {
      from: `"Sistema de vacunas" <${this.email}>`,
      to,
      subject: 'Notificación de vacunas faltantes',
      html: this.buildNotificationHtml(notifications, vaccineMap),
      attachments: [
        {
          filename: 'header.jpg',
          path: 'https://res.cloudinary.com/dwxlvv6lq/image/upload/v1718476935/zspdwq4pijyzp2bjrcyp.png',
          cid: 'headerImage' 
        },
        {
          filename: 'footer.jpg',
          path: 'https://res.cloudinary.com/dwxlvv6lq/image/upload/v1718476928/n754w8dlsqmnaokwnylf.png',
          cid: 'footerImage' 
        }
      ]
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

  private buildNotificationHtml(notifications: any, vaccineMap: any): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        .header {
          text-align: center;
          background-color: #007BFF;
          padding: 20px;
        }
        .header img {
          width: 80%;
          height: auto;
        }
        .content {
          padding: 20px;
        }
        .footer {
          text-align: center;
          background-color: #f0f0f0;
          padding: 20px;
        }
        .footer img {
          width: 80%;
          height: auto;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <img src="cid:headerImage" alt="Header Image">
      </div>
      <div class="content">
        <h1>Notificación de vacunas faltantes</h1>
        ${Object.keys(notifications).map(childName => `
          <h2>Hijo: ${childName}</h2>
          <p>Vacunas faltantes: ${notifications[childName].map(vaccineId => vaccineMap[vaccineId]).join(', ')}</p>
        `).join('')}
      </div>
      <div class="footer">
        <p>Este es un correo generado automáticamente. Por favor, no responda a este mensaje.</p>
        <p><a href="https://www.example.com">Visite nuestro sitio web</a> para más información.</p>
        <img src="cid:footerImage" alt="Footer Image">
      </div>
    </body>
    </html>
    `;
  }
}
