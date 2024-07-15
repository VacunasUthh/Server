import { Injectable, NotFoundException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schemas/user.schema';
import { VaccineMonth } from '../schemas/vaccineMonth.schema';
import { Vaccine } from '../schemas/vaccine.schema';
import { Children } from '../schemas/children.schema';
import { Campaigns } from '../schemas/campaigns.schema';

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
    @InjectModel(Vaccine.name) private vaccineModel: Model<Vaccine>,
    @InjectModel(Campaigns.name) private CampaignsModel: Model<Campaigns>
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

  async sendNotificationEmail(parentEmail: string, observation: string = 'Sin observación') {
    const user = await this.findOneByEmail(parentEmail);
    if (!user) {
      throw new NotFoundException('El correo electrónico no está registrado.');
    }

    const children = await this.childrenModel.find({ parentId: user._id }).exec();
    if (!children || children.length === 0) {
      throw new NotFoundException('No se encontraron hijos para este usuario.');
    }

    const vaccineMonths = await this.vaccineMonthModel.find().lean().exec();
    const notifications = {};
    const upcomingVaccinations = {};

    for (const child of children) {
      const birthDate = this.parseDateOfBirth(child.dateOfBirth);
      const childVaccines = child.vaccines || [];

      for (const vaccineMonth of vaccineMonths) {
        const expectedVaccineDate = this.calculateExpectedVaccineDate(birthDate, vaccineMonth.month);
        const currentDate = new Date();

        const missingVaccines = vaccineMonth.vaccines.filter(vaccineId => !childVaccines.includes(vaccineId));

        if (missingVaccines.length > 0) {
          if (currentDate > expectedVaccineDate) {
            if (!notifications[child.name]) {
              notifications[child.name] = [];
            }
            notifications[child.name].push(...missingVaccines.map(vaccineId => ({
              vaccineId,
              expectedVaccineDate,
              delayDays: this.calculateDaysDifference(expectedVaccineDate, currentDate)
            })));
          } else {
            if (!upcomingVaccinations[child.name]) {
              upcomingVaccinations[child.name] = [];
            }
            upcomingVaccinations[child.name].push(...missingVaccines.map(vaccineId => ({
              vaccineId,
              expectedVaccineDate
            })));
          }
        }
      }
    }

    for (const childName in notifications) {
      notifications[childName] = [...new Set(notifications[childName])];
    }

    for (const childName in upcomingVaccinations) {
      upcomingVaccinations[childName] = [...new Set(upcomingVaccinations[childName])];
    }

    if (Object.keys(notifications).length === 0 && Object.keys(upcomingVaccinations).length === 0) {
      console.log('No hay vacunas faltantes para notificar.');
      return { success: false, message: 'No hay vacunas faltantes para notificar.' };
    }

    const mailOptions = {
      from: `"Sistema de vacunas" <${this.email}>`,
      to: parentEmail,
      subject: 'Notificación de vacunas faltantes y próximas',
      html: await this.buildNotificationHtml(notifications, upcomingVaccinations, observation),
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



  private parseDateOfBirth(dateOfBirth: string): Date {
    const [day, month, year] = dateOfBirth.split('/').map(Number);
    return new Date(year, month - 1, day);
  }

  private calculateExpectedVaccineDate(birthDate: Date, months: number): Date {
    const expectedDate = new Date(birthDate);
    expectedDate.setMonth(expectedDate.getMonth() + months);
    return expectedDate;
  }

  private calculateDaysDifference(startDate: Date, endDate: Date): number {
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  private async buildNotificationHtml(notifications: any, upcomingVaccinations: any, observation: string): Promise<string> {
    let html = `
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
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th, td {
            border: 1px solid #dddddd;
            text-align: left;
            padding: 8px;
          }
          th {
            background-color: #f2f2f2;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="cid:headerImage" alt="Header Image">
        </div>
        <div class="content">
          <h1>Notificación de vacunas faltantes y próximas</h1>
    `;

    for (const childName in notifications) {
      html += `
          <h2>Hijo: ${childName}</h2>
          <table>
            <tr>
              <th>Vacuna</th>
              <th>Fecha esperada</th>
              <th>Días de retraso</th>
            </tr>
        `;

      for (const notification of notifications[childName]) {
        const vaccineId = notification.vaccineId;
        const expectedVaccineDate = notification.expectedVaccineDate.toLocaleDateString('es-ES');
        const delayDays = notification.delayDays;

        const vaccine = await this.vaccineModel.findById(vaccineId).lean().exec();
        const vaccineName = vaccine ? vaccine.name : 'Vacuna Desconocida';

        html += `
              <tr>
                <td>${vaccineName}</td>
                <td>${expectedVaccineDate}</td>
                <td>${delayDays}</td>
              </tr>
            `;
      }

      html += `</table>`;
    }

    if (Object.keys(upcomingVaccinations).length > 0) {
      for (const childName in upcomingVaccinations) {
        html += `
              <h2>Hijo: ${childName} (Vacunas próximas)</h2>
              <table>
                <tr>
                  <th>Vacuna</th>
                  <th>Fecha esperada</th>
                </tr>
            `;

        for (const vaccination of upcomingVaccinations[childName]) {
          const vaccineId = vaccination.vaccineId;
          const expectedVaccineDate = vaccination.expectedVaccineDate.toLocaleDateString('es-ES');

          const vaccine = await this.vaccineModel.findById(vaccineId).lean().exec();
          const vaccineName = vaccine ? vaccine.name : 'Vacuna Desconocida';

          html += `
                  <tr>
                    <td>${vaccineName}</td>
                    <td>${expectedVaccineDate}</td>
                  </tr>
                `;
        }

        html += `</table>`;
      }
    }

    if (observation) {
      html += `
            <h3>Observación:</h3>
            <p>${observation}</p>
        `;
    }

    html += `
        </div>
        <div class="footer">
          <img src="cid:footerImage" alt="Footer Image">
        </div>
      </body>
      </html>
    `;

    return html;
  }
  async sendNotificationCampaign(campaignId: string) {
    const campaign = await this.CampaignsModel.findById(campaignId).lean().exec();
    if (!campaign) {
      throw new NotFoundException('Campaña no encontrada');
    }

    const assignedNurseId = campaign.assignednurse;
    const users = await this.userModel.find({ assignedNurse: assignedNurseId }).exec();

    if (users.length === 0) {
      throw new NotFoundException('No se encontraron usuarios asignados a la enfermera');
    }

    for (const user of users) {
      const mailOptions = {
        from: `"Sistema de vacunas" <${this.email}>`,
        to: user.email,
        subject: `Notificación de campaña: ${campaign.name}`,
        html: this.buildCampaignNotificationHtml(campaign),
        attachments: [
          {
            filename: 'campaignHeader.jpg',
            path: campaign.images[0], // Assuming the first image is the header
            cid: 'campaignHeader'
          },
          {
            filename: 'campaignFooter.jpg',
            path: 'https://res.cloudinary.com/dwxlvv6lq/image/upload/v1718476928/n754w8dlsqmnaokwnylf.png',
            cid: 'campaignFooter'
          }
        ]
      };

      try {
        const info = await this.transporter.sendMail(mailOptions);
        console.log('Correo enviado: %s', info.messageId);
      } catch (error) {
        console.error('Error al enviar correo:', error);
      }
    }
  }

  private buildCampaignNotificationHtml(campaign: any): string {
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
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th, td {
            border: 1px solid #dddddd;
            text-align: left;
            padding: 8px;
          }
          th {
            background-color: #f2f2f2;
          }
          .btn {
            background-color: #007BFF;
            color: white;
            padding: 10px;
            text-align: center;
            text-decoration: none;
            display: inline-block;
            margin: 4px 2px;
            cursor: pointer;
          }
          .btn:hover {
            background-color: #0056b3;
          }
          .details {
            display: none;
            margin-top: 20px;
          }
          .details.show {
            display: block;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="cid:campaignHeader" alt="Header Image">
        </div>
        <div class="content">
          <h1>${campaign.name}</h1>
          <p>${campaign.description}</p>
          <button class="btn" onclick="toggleDetails()">Ver detalles</button>
          <div id="details" class="details">
            <table>
              <tr>
                <th>Fecha de inicio</th>
                <td>${new Date(campaign.startdate[0]).toLocaleDateString('es-ES')}</td>
              </tr>
              <tr>
                <th>Fecha de finalización</th>
                <td>${new Date(campaign.finaldate[0]).toLocaleDateString('es-ES')}</td>
              </tr>
              <tr>
                <th>Horario</th>
                <td>${campaign.hour[0]}</td>
              </tr>
              <tr>
                <th>Estado</th>
                <td>${campaign.state[0]}</td>
              </tr>
              <tr>
                <th>Ciudad</th>
                <td>${campaign.city[0]}</td>
              </tr>
              <tr>
                <th>Colonia</th>
                <td>${campaign.colony[0]}</td>
              </tr>
              <tr>
                <th>Vacunas</th>
                <td>${campaign.vaccines.join(', ')}</td>
              </tr>
              <tr>
                <th>Efectos secundarios</th>
                <td>${campaign.sideeffects.join(', ')}</td>
              </tr>
              <tr>
                <th>Edad</th>
                <td>${campaign.age.join(', ')}</td>
              </tr>
              <tr>
                <th>Enfermera asignada</th>
                <td>${campaign.assignednurse.join(', ')}</td>
              </tr>
            </table>
          </div>
        </div>
        <div class="footer">
          <img src="cid:campaignFooter" alt="Footer Image">
        </div>
        <script>
          function toggleDetails() {
            var details = document.getElementById("details");
            if (details.classList.contains("show")) {
              details.classList.remove("show");
            } else {
              details.classList.add("show");
            }
          }
        </script>
      </body>
      </html>
    `;
  }


}