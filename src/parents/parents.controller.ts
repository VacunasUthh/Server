import { Controller, Get } from '@nestjs/common';
import { ParentsService } from './parents.service';

@Controller('parents')
export class ParentsController {
  constructor(private readonly parentsService: ParentsService) {}

  @Get()
  async findAllWithChildren() {
    const parents = await this.parentsService.findAllWithChildren();
    return parents.map(parent => ({
      parentName: `${parent.name} ${parent.lastName}`,
      children: parent.children.map(child => ({
        childName: `${child.name} ${child.lastName}`,
      })),
    }));
  }
}
