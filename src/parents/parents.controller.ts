import { Controller, Get } from '@nestjs/common';
import { ParentsService } from './parents.service';

@Controller('parents')
export class ParentsController {
  constructor(private readonly parentsService: ParentsService) {}

  @Get()
  async getAllParentsWithChildren() {
    const parentsWithChildren = await this.parentsService.findAllWithChildren();
    return parentsWithChildren;
  }
}
