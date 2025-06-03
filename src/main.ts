import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());
  app.use(
    helmet({
      crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
    }),
  );
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:5173', 'https://healthflowfrontend-production.up.railway.app'],
    credentials: true,
  });

  const documentBuilder = new DocumentBuilder()
    .setTitle('My Nest API')
    .setDescription('Example of NestJS + Swagger')
    .setVersion('1.0.0');

  if (process.env.BYPASS_AUTH_FOR_SWAGGER !== 'true') {
    documentBuilder.addBearerAuth();
  }

  const config = documentBuilder.build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api-docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
