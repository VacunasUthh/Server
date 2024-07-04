import { Body, Controller, Get, Param, Post, Put, NotFoundException  } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from '../dto/users/create.users.dto';
import { UpdateUserDto } from '../dto/users/update.users.dto';

@Controller('users')
export class UsersController {
        constructor(private userService: UsersService) { }

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
                const user = await this.userService.findOne(id);
                if (!user) {
                        throw new NotFoundException(`User with ID ${id} not found`);
                }
                return user;
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

        @Post('reset-password')
        async resetPassword(@Body() body: { email: string; newPassword: string }) {
                const success = await this.userService.resetPassword(
                        body.email,
                        body.newPassword,
                );
                return { success };
        }
        @Post('loginWeb')
        async loginWeb(@Body() body: { email: string, password: string }) {
                const { email, password } = body;
                return this.userService.loginWeb(email, password);
        }
}
