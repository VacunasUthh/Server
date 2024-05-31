import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { CorsMiddleware } from './middlewares/cors.middleware'; // Importa el middleware

async function bootstrap() {
        const app = await NestFactory.create(AppModule);
        app.useGlobalPipes(new ValidationPipe());
        app.enableCors({
                origin: '*',
                methods: 'HEAD,PUT,PATCH,DELETE,OPTIONS',
                allowedHeaders: 'Content-Type, Accept',
                credentials: true, 
        });
        await app.listen(3000);
}
bootstrap();
