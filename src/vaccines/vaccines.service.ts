import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Vaccine } from '../schemas/vaccine.schema';
import { CreateVaccineDto } from '../dto/vaccines/create.vaccine.dto';
import { UpdateVaccineDto } from '../dto/vaccines/update.vaccine.dto';

@Injectable()
export class VaccinesService {
        constructor(
                @InjectModel(Vaccine.name) private vaccineModel: Model<Vaccine>,
        ) {}

        async findAll() {
                return this.vaccineModel.find();
        }

        async create(createVaccine: CreateVaccineDto) {
                const createdTask = new this.vaccineModel(createVaccine);
                return createdTask.save();
        }

        async update(id: string, updateVaccine: UpdateVaccineDto) {
                return this.vaccineModel.findByIdAndUpdate(id, updateVaccine, {
                        new: true,
                });
        }

        async findOne(id: string) {
                return this.vaccineModel.findById(id);
        }

        async delete(id: string) {
                return this.vaccineModel.findOneAndDelete({ _id: id });
        }
}
