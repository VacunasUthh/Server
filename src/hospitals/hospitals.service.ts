import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateHospitalDto } from '../dto/hospitals/create.hospital.tdo';
import { Hospitals } from '../schemas/hospitals.shema';

@Injectable()
export class HospitalsService {
        constructor(
                @InjectModel(Hospitals.name)
                private hospitalModel: Model<Hospitals>,
        ) {}

        async findAll() {
                return this.hospitalModel.find();
        }

        async create(createHospital: CreateHospitalDto) {
                const createdHospital = new this.hospitalModel(createHospital);
                return createdHospital.save();
        }

        async update(id: string, updateHospital: any) {
                return this.hospitalModel.findByIdAndUpdate(
                        id,
                        updateHospital,
                        {
                                new: true,
                        },
                );
        }

        async findOne(id: string) {
                return this.hospitalModel.findById(id);
        }

        async delete(id: string) {
                return this.hospitalModel.findOneAndDelete({ _id: id });
        }
}
