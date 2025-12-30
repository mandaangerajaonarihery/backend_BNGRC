import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix('serviceterritoriale');

  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('Service Territoriale API')
    .setDescription('Service Territoriale API description')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('serviceterritoriale', app, document,{
    swaggerOptions: {
      swaggerOptions: { persistAuthorization: true },
      customSiteTitle: 'Documentation API - Service Territoriale',
    },
  });

  app.getHttpAdapter().get('/serviceterritoriale/docs-json', (res: any) => {
    res.json(document);
  });

  const port = process.env.PORT ?? 3001;
  await app.listen(port);

  console.log(`🚀 Service Territoriale démarré sur ${port}`);
  console.log(`📚 Documentation disponible sur /docs`);
}
bootstrap();
