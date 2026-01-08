import { Module } from '@nestjs/common';
import { FichierService } from './fichier.service';
import { FichierController } from './fichier.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Fichier } from './entities/fichier.entity';
import { TypeRubrique } from 'src/type-rubrique/entities/type-rubrique.entity';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule } from '@nestjs/config';
import { CloudinaryProvider } from './cloudinary.provider'; // 🚀 N'oublie pas de créer ce fichier
import { CloudinaryService } from './cloudinary.service';
import { memoryStorage } from 'multer';

@Module({
  imports: [
    TypeOrmModule.forFeature([Fichier, TypeRubrique]),
    ConfigModule,
    // 🚀 On passe en memoryStorage pour Cloudinary et Vercel
    MulterModule.register({
      storage: memoryStorage(),
    }),
  ],
  controllers: [FichierController],
  // 🚀 Ajoute le Provider et le Service ici
  providers: [FichierService, CloudinaryProvider, CloudinaryService],
  // 🚀 Exporte le service pour que AuthModule puisse l'utiliser (Avatars)
  exports: [CloudinaryService], 
})
export class FichierModule { }