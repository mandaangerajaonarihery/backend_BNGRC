import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // 1. Configuration de base
  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix('serviceterritoriale');
  app.enableCors(); 

  // 2. Configuration du stockage statique (Inclus dans le préfixe pour ton Front)
  // URL : https://backend-bngrc.vercel.app/serviceterritoriale/storage/nom_du_fichier.ext
  app.useStaticAssets(join(__dirname, '..', 'storage'), {
    prefix: '/serviceterritoriale/storage',
  });

  // 3. Configuration Swagger
  const config = new DocumentBuilder()
    .setTitle('Service Territoriale API')
    .setDescription('Service Territoriale API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // RÉGLAGE CRUCIAL : On met le chemin à 'serviceterritoriale'
  // On désactive useGlobalPrefix ici pour éviter le doublon /serviceterritoriale/serviceterritoriale
  SwaggerModule.setup('serviceterritoriale', app, document, {
    useGlobalPrefix: false, 
    swaggerOptions: {
      persistAuthorization: true,
    },
    customSiteTitle: 'Documentation API - Service Territoriale',
  });

  // Route pour le JSON de la doc
  app.getHttpAdapter().get('/serviceterritoriale/docs-json', (req: any, res: any) => {
    res.json(document);
  });

  // 4. Logique de démarrage (Local vs Vercel)
  if (process.env.NODE_ENV !== 'production') {
    const port = process.env.PORT ?? 3000;
    await app.listen(port);
    console.log(`🚀 Serveur local : http://localhost:${port}/serviceterritoriale`);
  } else {
    // Sur Vercel, on initialise l'app et on retourne l'instance
    await app.init();
    return app.getHttpAdapter().getInstance();
  }
}

// L'exportation pour que Vercel puisse "saisir" l'application
export default bootstrap();