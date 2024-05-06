import { Module } from '@nestjs/common';
import { ChildrenService } from './children.service';
import { ChildrenController } from './children.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Children, ChildrenSchema } from '../schemas/children.schema';

@Module({
        imports: [
                MongooseModule.forFeature([
                        { name: Children.name, schema: ChildrenSchema },
                ]),
        ],
        controllers: [ChildrenController],
        providers: [ChildrenService],
})
export class ChildrenModule {}
