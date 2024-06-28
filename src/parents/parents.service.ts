import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { Response } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from '../schemas/user.schema';
import { Children } from '../schemas/children.schema';
import { Vaccine } from '../schemas/vaccine.schema';
import { VaccineMonth } from '../schemas/vaccineMonth.schema';

@Injectable()
export class ParentsService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Children.name) private childrenModel: Model<Children>,
    @InjectModel(Vaccine.name) private vaccineModel: Model<Vaccine>,
    @InjectModel(VaccineMonth.name) private vaccineMonthModel: Model<VaccineMonth>,
  ) { }

  async findAllUnassignedWithChildren(): Promise<any> {
    try {
      const parents = await this.userModel.find({ assignedNurse: null, typeUser: 'paciente' }).exec();

      const parentsWithChildren = await Promise.all(parents.map(async parent => {
        const children = await this.childrenModel.find({ parentId: parent._id }).exec();
        return {
          parentId: parent._id,
          parentName: `${parent.name} ${parent.lastName}`,
          children: children.map(child => ({
            childId: child._id,
            childName: `${child.name} ${child.lastName}`
          })),
        };
      }));

      return parentsWithChildren;
    } catch (error) {
      console.error('Error finding unassigned parents with children:', error);
      throw new InternalServerErrorException('Could not retrieve unassigned parents with children');
    }
  }

  async findNurseByEmail(email: string): Promise<string> {
    try {
      const nurse = await this.userModel.findOne({ email }).exec();
      if (!nurse) {
        console.error(`Nurse with email ${email} not found`);
        throw new NotFoundException('Nurse not found');
      }
      return nurse._id.toString();
    } catch (error) {
      console.error('Error finding nurse by email:', error);
      throw new InternalServerErrorException('Could not retrieve nurse by email');
    }
  }

  async assignToNurse(parentId: string, nurseEmail: string): Promise<void> {
    try {
      const nurseId = await this.findNurseByEmail(nurseEmail);
      const parentObjectId = new Types.ObjectId(parentId);
      const parentUpdateResult = await this.userModel.findByIdAndUpdate(parentObjectId, { assignedNurse: nurseId }).exec();
      if (!parentUpdateResult) {
        console.error(`Parent with ID ${parentId} not found`);
        throw new NotFoundException('Parent not found');
      }
      const childrenUpdateResult = await this.childrenModel.updateMany({ parentId: parentObjectId }, { assignedNurse: nurseId }).exec();
      console.log('Children update result:', childrenUpdateResult);
    } catch (error) {
      console.error('Error assigning nurse to parent and children:', error);
      throw new InternalServerErrorException('Could not assign nurse to parent and children');
    }
  }

  async findAssignedParentsAndChildren(nurseEmail: string): Promise<any> {
    const nurse = await this.userModel.findOne({ email: nurseEmail }).exec();
    if (!nurse) {
      throw new NotFoundException('Nurse not found');
    }

    const parents = await this.userModel.find({ assignedNurse: nurse._id }).exec();

    const parentsWithChildren = await Promise.all(parents.map(async parent => {
      const children = await this.childrenModel.find({ parentId: parent._id }).exec();
      return {
        parentId: parent._id,
        parentEmail: parent.email,
        parentName: `${parent.name} ${parent.lastName}`,
        children: children.map(child => ({
          childId: child._id,
          childName: `${child.name} ${child.lastName}`
        })),
      };
    }));

    return parentsWithChildren;
  }

  async findParentDetails(parentId: string): Promise<any> {
    try {
      const parent = await this.userModel.findById(parentId).exec();
      if (!parent) {
        throw new NotFoundException('Parent not found');
      }

      const children = await this.childrenModel.find({ parentId: parent._id }).exec();
      const childrenDetails = children.map(child => ({
        childId: child._id,
        childName: `${child.name} ${child.lastName}`,
        gender: child.gender || 'Sin información',
        date: child.dateOfBirth || 'Sin información',
        height: child.height || 'Sin información',
        weight: child.weight || 'Sin información',
        vaccines: child.vaccines || 'Sin información',
        hospital: child.hospital || 'Sin información',
      }));

      return {
        parentId: parent._id,
        parentName: `${parent.name} ${parent.lastName}`,
        children: childrenDetails,
      };
    } catch (error) {
      console.error('Error finding parent details:', error);
      throw new InternalServerErrorException('Could not retrieve parent details');
    }
  }

  private parseDateOfBirth(dateOfBirth: string): Date {
    const [day, month, year] = dateOfBirth.split('/').map(Number);
    return new Date(year, month - 1, day); // month - 1 porque los meses en JavaScript van de 0 a 11
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

  public async getVaccinationData(childId: string) {
    const child = await this.childrenModel.findById(childId).exec();
    if (!child) {
      throw new NotFoundException('Child not found.');
    }

    const parent = await this.userModel.findById(child.parentId).exec();
    if (!parent) {
      throw new NotFoundException('Parent not found.');
    }

    const vaccineMonths = await this.vaccineMonthModel.find().lean().exec();
    const notifications = [];
    const upcomingVaccinations = [];

    const birthDate = this.parseDateOfBirth(child.dateOfBirth);
    const childVaccines = child.vaccines || [];

    const allVaccines = await this.vaccineModel.find().lean().exec();
    const vaccineMap = allVaccines.reduce((acc, vaccine) => {
      acc[vaccine._id.toString()] = vaccine.name;
      return acc;
    }, {} as { [key: string]: string });

    for (const vaccineMonth of vaccineMonths) {
      const expectedVaccineDate = this.calculateExpectedVaccineDate(birthDate, vaccineMonth.month);
      const currentDate = new Date();

      const missingVaccines = vaccineMonth.vaccines.filter(vaccineId => !childVaccines.includes(vaccineId.toString()));

      if (missingVaccines.length > 0) {
        if (currentDate > expectedVaccineDate) {
          notifications.push(...missingVaccines.map(vaccineId => ({
            vaccineId: vaccineId.toString(),
            vaccineName: vaccineMap[vaccineId.toString()],
            expectedVaccineDate,
            delayDays: this.calculateDaysDifference(expectedVaccineDate, currentDate),
          })));
        } else {
          upcomingVaccinations.push(...missingVaccines.map(vaccineId => ({
            vaccineId: vaccineId.toString(),
            vaccineName: vaccineMap[vaccineId.toString()],
            expectedVaccineDate,
          })));
        }
      }
    }

    return {
      childName: `${child.name} ${child.lastName}`,
      childBirthDate: child.dateOfBirth,
      parentName: `${parent.name} ${parent.lastName}`,
      notifications,
      upcomingVaccinations
    };
  }

  async generateVaccinationReport(childId: string, res: Response): Promise<void> {
    try {
      const vaccinationData = await this.getVaccinationData(childId);

      const doc = new PDFDocument();
      doc.pipe(res);

      // Configuración del documento PDF
      doc.fontSize(15).text('Reporte de Vacunación', { align: 'center' });

      doc.moveDown();

      // Datos del niño
      doc.fontSize(12).text(`Nombre del Niño: ${vaccinationData.childName}`);
      doc.text(`Fecha de Nacimiento: ${new Date(vaccinationData.childBirthDate).toLocaleDateString()}`);
      doc.text(`Nombre del Padre: ${vaccinationData.parentName}`);

      doc.moveDown();

      // Notificaciones
      doc.fontSize(12).text('Vacunas Retrasadas:');
      doc.table({
        headers: ['Nombre de la Vacuna', 'Fecha Esperada', 'Días de Retraso'],
        rows: vaccinationData.notifications.map(notification => [
          notification.vaccineName,
          new Date(notification.expectedVaccineDate).toLocaleDateString(),
          notification.delayDays.toString()
        ])
      });

      doc.moveDown();

      // Próximas Vacunaciones
      doc.fontSize(12).text('Próximas Vacunaciones:');
      doc.table({
        headers: ['Nombre de la Vacuna', 'Fecha Esperada'],
        rows: vaccinationData.upcomingVaccinations.map(vaccination => [
          vaccination.vaccineName,
          new Date(vaccination.expectedVaccineDate).toLocaleDateString()
        ])
      });

      // Finalizar el documento y enviarlo al cliente
      doc.end();

    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new InternalServerErrorException('Error generating PDF report');
    }
  }
}


