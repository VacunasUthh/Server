import { Injectable } from '@nestjs/common';
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

  async findAllWithChildren(): Promise<any> {
    const parents = await this.userModel.find().exec(); 

    const parentsWithChildren = await Promise.all(parents.map(async parent => {
      const children = await this.childrenModel.find({ parentId: parent._id }).exec(); // Buscar hijos del padre actual
      return {
        parentId: parent._id,
        parentName: `${parent.name} ${parent.lastName}`,
        children: children.map(child => ({
          childId: child._id,
          childName: `${child.name} ${child.lastName}`
          // Aquí puedes incluir más campos de los hijos si es necesario
        })),
      };
    }));

    return parentsWithChildren;
  }
}
