import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { HospitalsService } from './hospitals.service';
import { CreateHospitalDto } from '../dto/hospitals/create.hospital.tdo';

@Controller('hospitals')
export class HospitalsController {
        constructor(private hospitalService: HospitalsService) {}

        @Get()
        async findAll() {
                return this.hospitalService.findAll();
        }

        @Get(':id')
        async findOne(@Param('id') id: string) {
                return this.hospitalService.findOne(id);
        }

        @Post()
        async create(@Body() createHospital: CreateHospitalDto) {

                return this.hospitalService.create(createHospital);
        }

        @Put(':id')
        async update(@Param('id') id: string, updateHospital: any) {
                return this.hospitalService.update(id, updateHospital);
        }

        @Delete(':id')
        async delete(@Param('id') id: string) {
                return this.hospitalService.delete(id);
        }
}
