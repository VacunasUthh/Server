import { Controller, Get, Param, NotFoundException, InternalServerErrorException, Query, Post, Body, Res } from '@nestjs/common';
import { Response } from 'express';
import { ParentsService } from './parents.service';

@Controller('parents')
export class ParentsController {
  constructor(private readonly parentsService: ParentsService) {}

  @Get('unassigned')
  async getAllUnassignedWithChildren() {
    return await this.parentsService.findAllUnassignedWithChildren();
  }

  @Get('assigned')
  async getAssignedParentsAndChildren(@Query('email') email: string) {
    return await this.parentsService.findAssignedParentsAndChildren(email);
  }

  @Post('assign')
  async assignToNurse(
    @Body('parentId') parentId: string,
    @Body('nurseEmail') nurseEmail: string,
  ): Promise<void> {
    await this.parentsService.assignToNurse(parentId, nurseEmail);
  }

  @Get('details/:parentId')
  async getParentDetails(@Param('parentId') parentId: string) {
    try {
      const parentDetails = await this.parentsService.findParentDetails(parentId);
      return parentDetails;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('Parent not found');
      }
      throw new InternalServerErrorException('Could not retrieve parent details');
    }
  }
  
  @Get('child/:childId')
  async getChildVaccinations(@Param('childId') childId: string) {
    const vaccineData = await this.parentsService.getVaccinationData(childId);
    return vaccineData;
  }

  @Get('cartilla/:childId')
  async getChildCartilla(@Param('childId') childId: string) {
    const vaccineData = await this.parentsService.getVaccinationDataDetails(childId);
    return vaccineData;
  }

  @Post('apply-vaccine')
  async applyVaccine(@Body() applyVaccineDto: { childId: string; month: number; vaccineId: string }) {
    return this.parentsService.applyVaccine(applyVaccineDto.childId, applyVaccineDto.month, applyVaccineDto.vaccineId);
  }
}
