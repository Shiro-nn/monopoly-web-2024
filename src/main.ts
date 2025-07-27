import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import config from "./config";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.enableCors({
        origin: '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        allowedHeaders: 'Content-Type, Accept, Authorization',
        credentials: true,
    });

    await app.listen(config.port);
    console.log("Http server is running on port: " + config.port);
}

bootstrap().catch(err => console.error(err));