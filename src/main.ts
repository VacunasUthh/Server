import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
        const app = await NestFactory.create(AppModule);
        app.useGlobalPipes(new ValidationPipe());
        app.enableCors({
                origin: ['http://localhost:5173', 'http://localhost:3000', 'https://example.com'],
                methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
                allowedHeaders: 'Content-Type, Accept',
        });
        await app.listen(3000);
}
bootstrap();
