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
    return this.userModel.aggregate([
      {
        $lookup: {
          from: 'children',
          localField: '_id',
          foreignField: 'parentId',
          as: 'children',
        },
      },
      {
        $project: {
          name: 1,
          lastName: 1,
          'children.name': 1,
          'children.lastName': 1,
        },
      },
    ]).exec();
  }
}
