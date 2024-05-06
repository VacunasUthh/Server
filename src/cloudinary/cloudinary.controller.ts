import {
        Controller,
        Get,
        Post,
        Body,
        Patch,
        Param,
        Delete,
        UseInterceptors,
        UploadedFile,
        MaxFileSizeValidator,
        FileTypeValidator,
        ParseFilePipe,
} from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('upload')
export class CloudinaryController {
        constructor(private readonly cloudinaryService: CloudinaryService) {}
 
        @Post()
        @UseInterceptors(FileInterceptor('file'))
        uploadImage(
                @UploadedFile(
                        new ParseFilePipe({
                                validators: [
                                        new FileTypeValidator({
                                                fileType: '.(png|jpg|jpeg|gif|svg)',
                                        }),
                                ],
                        }),
                )
                file: Express.Multer.File,
        ) {
                return this.cloudinaryService.uploadFile(file);
        }

        @Get()
        findAll() {
                return 'This action returns all cloudinary';
        }
}
