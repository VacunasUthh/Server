import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { VaccinesService } from './vaccines.service';
import { CreateVaccineDto } from '../dto/vaccines/create.vaccine.dto';
import { UpdateVaccineDto } from '../dto/vaccines/update.vaccine.dto';
import { Vaccine } from '../schemas/vaccine.schema';
import { VaccineMonth } from '../schemas/vaccineMonth.schema';

@Controller('vaccines')
export class VaccinesController {
        constructor(private vaccineService: VaccinesService) { }

        @Get()
        async findAll() {
                return this.vaccineService.findAll();
        }

        @Get(':id')
        async findOne(@Param('id') id: string) {
                return this.vaccineService.findOne(id);
        }

        @Post()
        async create(@Body() createVaccineDto: CreateVaccineDto): Promise<Vaccine> {
                return this.vaccineService.create(createVaccineDto);
        }

        @Put('/months')
        async addVaccineToMonths(
                @Body('vaccineId') vaccineId: string,
                @Body('monthIds') monthIds: string[],
        ): Promise<VaccineMonth[]> {
                return this.vaccineService.addVaccineToMonths(vaccineId, monthIds);
        }

        @Put(':id')
        async update(@Param('id') id: string, @Body() updateVaccine: UpdateVaccineDto) {

                return this.vaccineService.update(id, updateVaccine)
                //return this.vaccineService.update();
        }

        @Delete(':id')
        async delete(@Param('id') id: string) {
                console.log(id);
                return this.vaccineService.delete(id);
                //return this.vaccineService.delete();
        }
}
