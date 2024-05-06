import {
        Controller,
        Get,
        Post,
        Body,
        Patch,
        Param,
        Delete,
} from '@nestjs/common';
import { VaccineMonthService } from './vaccine-month.service';
import { CreateVaccineMonthDto } from '../dto/vaccine-month/create-vaccine-month.dto';
import { UpdateVaccineMonthDto } from '../dto/vaccine-month/update-vaccine-month.dto';

@Controller('vaccine-month')
export class VaccineMonthController {
        constructor(
                private readonly vaccineMonthService: VaccineMonthService,
        ) {}

        @Post()
        async create(@Body() createVaccineMonthDto: CreateVaccineMonthDto) {
                return await this.vaccineMonthService.create(
                        createVaccineMonthDto,
                );
        }

        @Get()
        async findAll() {
                return await this.vaccineMonthService.findAll();
        }

        @Get(':id')
        async findOne(@Param('id') id: string) {
                return await this.vaccineMonthService.findOne(id);
        }

        @Get('vaccines/:id')
        async findVaccineForMonth(@Param('id') id: string) {
                return await this.vaccineMonthService.findVaccineForMonth(id);
        }

        @Patch(':id')
        async update(
                @Param('id') id: string,
                @Body() updateVaccineMonthDto: UpdateVaccineMonthDto,
        ) {
                return await this.vaccineMonthService.update(
                        id,
                        updateVaccineMonthDto,
                );
        }

        @Delete(':id')
        async remove(@Param('id') id: string) {
                return await this.vaccineMonthService.remove(id);
        }
}
