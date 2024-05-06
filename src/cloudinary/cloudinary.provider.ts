import { v2 as cloudinary } from 'cloudinary';

export const CloudinaryProvider = {
        provide: 'CLOUDINARY',

        useFactory: () => {
                return cloudinary.config({
                        cloud_name: 'dbemk0dix',
                        api_key: '913586913345416',
                        api_secret: 'nzrQDuTKOvozmb68_-IBjOz-Ufk',
                })
        },
};
