import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from '../dto/users/create.users.dto';
import { UpdateUserDto } from '../dto/users/update.users.dto';

@Controller('users')
export class UsersController {
        constructor(private userService: UsersService) {}

        @Get()
        async findAll() {
                return this.userService.findAll();
        }

        @Get('parents')
        async findAllParents() {
                return await this.userService.findAllParents();
        }

        @Get(':id')
        async findOne(id: string) {
                return await this.userService.findOne(id);
        }

        @Post()
        async create(@Body() createUser: CreateUserDto) {
                return this.userService.create(createUser);
        }

        @Put(':id')
        async update(
                @Body() updateUser: UpdateUserDto,
                @Param('id') id: string,
        ) {
                return this.userService.update(id, updateUser);
        }
}
