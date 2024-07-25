import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
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

  public async getVaccinationDataDetails(childId: string) {
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
    const appliedVaccinations = [];

    const birthDate = this.parseDateOfBirth(child.dateOfBirth);
    const appliedVaccines = child.appliedVaccines || [];

    const allVaccines = await this.vaccineModel.find().lean().exec();
    const vaccineMap = allVaccines.reduce((acc, vaccine) => {
      acc[vaccine._id.toString()] = vaccine;
      return acc;
    }, {} as { [key: string]: Vaccine });

    for (const vaccineMonth of vaccineMonths) {
      const expectedVaccineDate = this.calculateExpectedVaccineDate(birthDate, vaccineMonth.month);
      const currentDate = new Date();

      const missingVaccines = vaccineMonth.vaccines.filter(vaccineId =>
        !appliedVaccines.some(applied => applied.vaccineId === vaccineId.toString() && applied.month === vaccineMonth.month)
      );

      const appliedInMonth = appliedVaccines.filter(applied => applied.month === vaccineMonth.month);

      for (const applied of appliedInMonth) {
        const vaccine = vaccineMap[applied.vaccineId];
        appliedVaccinations.push({
          vaccineId: applied.vaccineId,
          vaccineName: vaccine.name,
          disease: vaccine.disease,
          applicationDate: expectedVaccineDate,
          description: vaccine.description,
          application: vaccine.application,
          contraindications: vaccine.contraindications,
          area: vaccine.area,
          gravity: vaccine.gravity,
          month: vaccineMonth.month
        });
      }

      if (missingVaccines.length > 0) {
        if (currentDate > expectedVaccineDate) {
          notifications.push(...missingVaccines.map(vaccineId => {
            const vaccine = vaccineMap[vaccineId.toString()];
            return {
              vaccineId: vaccineId.toString(),
              vaccineName: vaccine.name,
              disease: vaccine.disease,
              expectedVaccineDate,
              delayDays: this.calculateDaysDifference(expectedVaccineDate, currentDate),
              description: vaccine.description,
              application: vaccine.application,
              contraindications: vaccine.contraindications,
              area: vaccine.area,
              gravity: vaccine.gravity,
              month: vaccineMonth.month,
            };
          }));
        } else {
          upcomingVaccinations.push(...missingVaccines.map(vaccineId => {
            const vaccine = vaccineMap[vaccineId.toString()];
            return {
              vaccineId: vaccineId.toString(),
              vaccineName: vaccine.name,
              disease: vaccine.disease,
              expectedVaccineDate,
              description: vaccine.description,
              dose: vaccine.dose,
              contraindications: vaccine.contraindications,
              area: vaccine.area,
              gravity: vaccine.gravity,
              month: vaccineMonth.month,
            };
          }));
        }
      }
    }

    return {
      childName: `${child.name} ${child.lastName}`,
      childBirthDate: child.dateOfBirth,
      parentName: `${parent.name} ${parent.lastName}`,
      notifications,
      upcomingVaccinations,
      appliedVaccinations
    };
  }

  public async applyVaccine(childId: string, month: number, vaccineId: string) {
    const child = await this.childrenModel.findById(childId).exec();
    if (!child) {
      throw new NotFoundException('Child not found.');
    }

    const alreadyApplied = child.appliedVaccines?.some(
      (applied) => applied.vaccineId === vaccineId && applied.month === month
    );

    if (alreadyApplied) {
      throw new Error('Vaccine already applied for this month.');
    }

    const newAppliedVaccine = { month, vaccineId };
    if (!child.appliedVaccines) {
      child.appliedVaccines = [];
    }
    child.appliedVaccines.push(newAppliedVaccine);

    await child.save();

    return { message: 'Vaccine applied successfully.' };
  }

  public async confirmationVaccine(childId: string, month: number, vaccineId: string) {
    const child = await this.childrenModel.findById(childId).exec();
    if (!child) {
      throw new NotFoundException('Child not found.');
    }

    const alreadyConfirmed = child.confirmationVaccines?.some(
      (confirmed) => confirmed.vaccineId === vaccineId && confirmed.month === month
    );

    if (alreadyConfirmed) {
      throw new Error('Vaccine already applied for this month.');
    }

    const newConfirmedVaccine = { month, vaccineId };
    if (!child.confirmationVaccines) {
      child.confirmationVaccines = [];
    }
    child.confirmationVaccines.push(newConfirmedVaccine);

    await child.save();

    return { message: 'Vaccine confirmed successfully.' };
  }



}


