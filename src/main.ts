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
  app.enableCors(); // Crucial pour ton bouton Télécharge

  app.useStaticAssets(join(__dirname, '..', 'storage'), {
    prefix: '/storage',
  });

  const config = new DocumentBuilder()
    .setTitle('Service Territoriale API')
    .setDescription('Service Territoriale API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('serviceterritoriale', app, document);

  // Correction de la route JSON (ajout de 'req')
  app.getHttpAdapter().get('/serviceterritoriale/docs-json', (req: any, res: any) => {
    res.json(document);
  });

  // --- LOGIQUE DE DÉPLOIEMENT ---
  if (process.env.NODE_ENV !== 'production') {
    const port = process.env.PORT ?? 3000;
    await app.listen(port);
  } else {
    // Sur Vercel, on initialise juste l'app
    await app.init();
    return app.getHttpAdapter().getInstance();
  }
}

// L'EXPORTATION QUE VERCEL CHERCHE
export default bootstrap();