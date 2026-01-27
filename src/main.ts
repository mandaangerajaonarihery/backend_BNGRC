import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Sécurité et accessibilité pour ton bouton de téléchargement React
  app.enableCors();
  
  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix('serviceterritoriale');

  // Configuration du dossier de stockage statique
  app.useStaticAssets(join(__dirname, '..', 'storage'), {
    prefix: '/storage',
  });

  // Configuration Swagger
  const config = new DocumentBuilder()
    .setTitle('Service Territoriale API')
    .setDescription('Service Territoriale API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('serviceterritoriale', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      customSiteTitle: 'Documentation API - Service Territoriale',
    },
  });

  // Endpoint pour le JSON Swagger (utile pour certains outils)
  app.getHttpAdapter().get('/serviceterritoriale/docs-json', (req: any, res: any) => {
    res.json(document);
  });

  // ADAPTATION VERCEL : On n'écoute le port que si on est en local
  if (process.env.NODE_ENV !== 'production') {
    const port = process.env.PORT ?? 3000;
    await app.listen(port);
    console.log(`🚀 Service démarré : http://localhost:${port}/serviceterritoriale`);
  } else {
    // Sur Vercel, on initialise l'app sans app.listen()
    await app.init();
    return app.getHttpAdapter().getInstance();
  }
}

// CRUCIAL : Exporter l'exécution pour Vercel
export default bootstrap();