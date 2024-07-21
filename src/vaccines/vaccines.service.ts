import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Vaccine } from '../schemas/vaccine.schema';
import { CreateVaccineDto } from '../dto/vaccines/create.vaccine.dto';
import { UpdateVaccineDto } from '../dto/vaccines/update.vaccine.dto';
import { VaccineMonth, VaccineMonthSchema, } from '../schemas/vaccineMonth.schema';

@Injectable()
export class VaccinesService {
        constructor(
                @InjectModel(Vaccine.name) private vaccineModel: Model<Vaccine>,
                @InjectModel(VaccineMonth.name) private vaccineMonthModel: Model<VaccineMonth>,
        ) { }

        async findAll() {
                return this.vaccineModel.find();
        }

        async create(createVaccineDto: CreateVaccineDto): Promise<Vaccine> {
                const createdVaccine = new this.vaccineModel(createVaccineDto);
                const savedVaccine = await createdVaccine.save();

                return savedVaccine;
        }

        async addVaccineToMonths(vaccineId: string, monthIds: string[]): Promise<VaccineMonth[]> {
                const promises = monthIds.map(monthId =>
                        this.vaccineMonthModel.findByIdAndUpdate(monthId, {
                                $push: { vaccines: vaccineId },
                        }, { new: true })
                );

                return Promise.all(promises);
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
