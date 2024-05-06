import {
        Body,
        Controller,
        Delete,
        Get,
        Param,
        Post,
        Put,
} from '@nestjs/common';
import { ChildrenService } from './children.service';
import { CreateChildrenDto } from '../dto/children/create.children.dto';

@Controller('children')
export class ChildrenController {
        constructor(private childrenService: ChildrenService) {}

        @Get()
        async findAll() {
                return this.childrenService.findAll();
        }

        @Get('parent/:id')
        async findForParent(@Param('id') id: string) {
                return await this.childrenService.findForParent(id);
        }

        @Get(':id')
        async findOne(@Param('id') id: string) {
                return this.childrenService.findOne(id);
        }

        @Post()
        async create(@Body() createChildren: CreateChildrenDto) {
                return this.childrenService.create(createChildren);
        }

        @Put(':id')
        async update(@Body() updateChildren: any, @Param('id') id: string) {
                return this.childrenService.update(id, updateChildren);
        }

        @Delete(':id')
        async delete(@Param('id') id: string) {
                return this.childrenService.delete(id);
        }
}
