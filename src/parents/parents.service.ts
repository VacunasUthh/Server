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
          from: 'children', // Nombre de la colección de hijos
          localField: '_id', // Campo en la colección de padres
          foreignField: 'parentId', // Campo en la colección de hijos
          as: 'children', // Nombre del campo donde se almacenarán los hijos
        },
      },
      {
        $project: {
          parentName: { $concat: ['$name', ' ', '$lastName'] }, // Concatenar nombre completo del padre
          children: '$children', // Incluir todos los campos de los hijos
        },
      },
    ]).exec();
  }
}
