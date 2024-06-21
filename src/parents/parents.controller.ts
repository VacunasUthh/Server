import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ParentsService } from './parents.service';

@Controller('parents')
export class ParentsController {
  constructor(private readonly parentsService: ParentsService) {}

  @Get('unassigned')
  async findAllUnassignedWithChildren() {
    return this.parentsService.findAllUnassignedWithChildren();
  }

  @Post('assign')
  async assignToNurse(
    @Body('parentId') parentId: string,
    @Body('nurseEmail') nurseEmail: string,
  ) {
    return this.parentsService.assignToNurse(parentId, nurseEmail);
  }
}
