import { Controller, Get, Post, Body, HttpException, HttpStatus, Query } from '@nestjs/common';
import { ParentsService } from './parents.service';

@Controller('parents')
export class ParentsController {
  constructor(private readonly parentsService: ParentsService) {}

  @Get('unassigned')
  async findAllUnassignedWithChildren() {
    return this.parentsService.findAllUnassignedWithChildren();
  }

  @Get('assigned')
  async findAssignedParentsAndChildren(@Query('email') nurseEmail: string) {
    return this.parentsService.findAssignedParentsAndChildren(nurseEmail);
  }

  @Post('assign')
  async assignNurse(@Body() assignNurseDto: { parentId: string, nurseEmail: string }): Promise<void> {
    try {
      await this.parentsService.assignToNurse(assignNurseDto.parentId, assignNurseDto.nurseEmail);
    } catch (error) {
      console.error('Error in assignNurse controller:', error);
      throw new HttpException('Could not assign nurse', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
