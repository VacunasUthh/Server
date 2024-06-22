import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from '../schemas/user.schema';
import { Children } from '../schemas/children.schema';
import { Vaccine } from '../schemas/vaccine.schema';

@Injectable()
export class ParentsService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Children.name) private childrenModel: Model<Children>,
    @InjectModel(Vaccine.name) private vaccineModel: Model<Vaccine>,
  ) {}

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
      const childrenWithVaccinations = await Promise.all(children.map(async child => {
        const vaccinations = await this.vaccineModel.find({ childId: child._id }).exec();
        return {
          childId: child._id,
          childName: `${child.name} ${child.lastName}`,
          vaccinations: vaccinations.map(vaccine => ({
            vaccineName: vaccine.name,
            vaccinationDate: vaccine.date
          })),
        };
      }));

      return {
        parentId: parent._id,
        parentName: `${parent.name} ${parent.lastName}`,
        children: childrenWithVaccinations,
      };
    } catch (error) {
      console.error('Error finding parent details:', error);
      throw new InternalServerErrorException('Could not retrieve parent details');
    }
  }
}
