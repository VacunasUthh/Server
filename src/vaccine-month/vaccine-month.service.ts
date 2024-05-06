import { Injectable } from '@nestjs/common';
import { CreateVaccineMonthDto } from '../dto/vaccine-month/create-vaccine-month.dto';
import { UpdateVaccineMonthDto } from '../dto/vaccine-month/update-vaccine-month.dto';
import { InjectModel } from '@nestjs/mongoose';
import { VaccineMonth } from '../schemas/vaccineMonth.schema';
import { Model } from 'mongoose';
import { Vaccine } from 'src/schemas/vaccine.schema';

@Injectable()
export class VaccineMonthService {
        constructor(
                @InjectModel(VaccineMonth.name)
                private vaccineMonthModel: Model<VaccineMonth>,

                @InjectModel(Vaccine.name)
                private vaccineModel: Model<Vaccine>,
        ) {}

        async create(createVaccineMonthDto: CreateVaccineMonthDto) {
                return await this.vaccineMonthModel.create(
                        createVaccineMonthDto,
                );
        }

        async findAll() {
                return await this.vaccineMonthModel.find();
        }

        async findOne(id: string) {
                return await this.vaccineMonthModel.findById(id);
        }

        async findVaccineForMonth(id: string) {
                const responde = await this.vaccineMonthModel.find({
                        _id: id,
                });

                const { vaccines } = responde[0];

                //verifico se o array de vacinas está vazio
                if (vaccines.length === 0) {
                        
                        return {
                                statusCode: 404,
                                message: 'No vaccines for this month',
                        };
                }

                const results = await this.vaccineModel.find({
                        _id: { $in: vaccines },
                });

                return results;
        }

        async update(id: string, updateVaccineMonthDto: UpdateVaccineMonthDto) {
                return await this.vaccineMonthModel.findByIdAndUpdate(
                        id,
                        updateVaccineMonthDto,
                        {
                                new: true,
                        },
                );
        }

        async remove(id: string) {
                return await this.vaccineMonthModel.findOneAndDelete({
                        _id: id,
                });
        }
}
