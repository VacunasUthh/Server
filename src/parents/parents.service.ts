import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from '../schemas/user.schema';
import { Children } from '../schemas/children.schema';

@Injectable()
export class ParentsService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Children.name) private childrenModel: Model<Children>,
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
      const nurse = await this.userModel.findOne({ email, typeUser: 'nurse' }).exec();
      if (!nurse) {
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
      const parentObjectId = new Types.ObjectId(parentId); // Asegurarse de que el parentId sea un ObjectId
      await this.userModel.findByIdAndUpdate(parentObjectId, { assignedNurse: nurseId }).exec();
      await this.childrenModel.updateMany({ parentId: parentObjectId }, { assignedNurse: nurseId }).exec();
    } catch (error) {
      console.error('Error assigning nurse to parent and children:', error);
      throw new InternalServerErrorException('Could not assign nurse to parent and children');
    }
  }
}
