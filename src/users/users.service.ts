import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from '../dto/users/create.users.dto';
import { User } from '../schemas/user.schema';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
        constructor(@InjectModel(User.name) private userModel: Model<User>) { }

        async findAll() {
                return this.userModel.find();
        }

        async create(createUser: CreateUserDto) {
                createUser.password = await bcrypt.hash(
                        createUser.password.trim(),
                        10,
                );
                createUser.email = createUser.email.toLowerCase();
                const createdUser = new this.userModel(createUser);
                return createdUser.save();
        }

        async update(id: string, updateUser: any) {
                if (updateUser.password) {
                        updateUser.password = await bcrypt.hash(
                                updateUser.password,
                                10,
                        );
                }

                return this.userModel.findByIdAndUpdate(
                        { _id: id },
                        updateUser,
                        {
                                new: true,
                        },
                );
        }

        async findAllParents() {
                return await this.userModel
                        .find({
                                typeUser: 'paciente',
                        })
                        .select('-password');
        }

        async findOne(id: string): Promise<User> {
                return await this.userModel.findById(id).exec();
        }

        async findOneByEmail(email: string) {
                return await this.userModel.findOne({ email });
        }

        async delete(id: string) {
                return this.userModel.findOneAndDelete({ _id: id });
        }

        async resetPassword(email: string, newPassword: string): Promise<boolean> {
                const user = await this.findOneByEmail(email);
                if (!user) {
                        return false;
                }
                user.password = await bcrypt.hash(newPassword, 10);
                await user.save();
                return true;
        }

        async loginWeb(email: string, password: string) {
                const user = await this.findOneByEmail(
                        email.toLocaleLowerCase().trim(), // Corregido el acceso a la función dentro del servicio
                );

                if (!user) {
                        throw new UnauthorizedException('Las credenciales no son válidas.');
                }

                const isValid = await bcrypt.compare(password.trim(), user.password);

                if (!isValid) {
                        throw new UnauthorizedException('Las credenciales no son válidas.');
                }

                if (user.typeUser !== 'trabajador') {
                        throw new ForbiddenException('Acceso denegado para pacientes.');
                }

                delete user.password;
                return user;
        }//

        async updateUserById(id: string, updateUser: any) {
                const currentUser = await this.userModel.findById(id).exec();
                if (!currentUser) {
                    throw new Error('User not found');
                }
                const updates = {};
                for (const key in updateUser) {
                    if (updateUser.hasOwnProperty(key)) {
                        updates[key] = updateUser[key];
                    }
                }
            
                if (Object.keys(updates).length > 0) {
                    return this.userModel.findByIdAndUpdate(
                        id,
                        { $set: updates },
                        {
                            new: true,
                            runValidators: true,
                        },
                    ).exec();
                }
                return currentUser;
            }
            

}
