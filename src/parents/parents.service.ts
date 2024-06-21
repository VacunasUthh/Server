import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schemas/user.schema';
import { Children } from '../schemas/children.schema';

@Injectable()
export class ParentsService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Children.name) private childrenModel: Model<Children>,
  ) {}

  async findAllUnassignedWithChildren(): Promise<any> {
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
  }

  async findNurseByEmail(email: string): Promise<string> {
    const nurse = await this.userModel.findOne({ email, typeUser: 'nurse' }).exec();
    if (!nurse) {
      throw new NotFoundException('Nurse not found');
    }
    return nurse._id.toString();
  }

  async assignToNurse(parentId: string, nurseEmail: string): Promise<void> {
    const nurseId = await this.findNurseByEmail(nurseEmail);
    await this.userModel.findByIdAndUpdate(parentId, { assignedNurse: nurseId }).exec();
    await this.childrenModel.updateMany({ parentId }, { assignedNurse: nurseId }).exec();
  }
}
