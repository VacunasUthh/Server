import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateChildrenDto } from '../dto/children/create.children.dto';
import { Children } from '../schemas/children.schema';

@Injectable()
export class ChildrenService {
        constructor(
                @InjectModel(Children.name)
                private childrenModel: Model<Children>,
        ) {}

        async findAll() {
                return this.childrenModel.find();
        }

        async create(createChildren: CreateChildrenDto) {
                const createdChildren = new this.childrenModel(createChildren);
                return createdChildren.save();
        }

        async update(id: string, updateChildren: any) {
                return this.childrenModel.findByIdAndUpdate(
                        id,
                        updateChildren,
                        { new: true },
                );
        }

        async findForParent(id: string) {
                return await this.childrenModel.find({ parentId: id });
        }

        async findOne(id: string) {
                return await this.childrenModel.findById({ _id: id });
        }

        async delete(id: string) {
                return await this.childrenModel.findOneAndDelete({ _id: id });
        }
}
