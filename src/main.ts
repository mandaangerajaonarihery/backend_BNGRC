import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix('serviceterritoriale');

  app.useStaticAssets(join(__dirname, '..', 'storage'), {
    prefix: '/storage',
  });

  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('Service Territoriale API')
    .setDescription('Service Territoriale API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('serviceterritoriale', app, document, {
    swaggerOptions: {
      swaggerOptions: { persistAuthorization: true },
      customSiteTitle: 'Documentation API - Service Territoriale',
    },
  });

  app.getHttpAdapter().get('/serviceterritoriale/docs-json', (res: any) => {
    res.json(document);
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(`🚀 Service Territoriale démarré sur ${port}`);
  console.log(`📚 Documentation disponible sur /docs`);
}
bootstrap();
