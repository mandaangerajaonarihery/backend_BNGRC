import { Module } from '@nestjs/common';
import { FichierService } from './fichier.service';
import { FichierController } from './fichier.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Fichier } from './entities/fichier.entity';
import { TypeRubrique } from 'src/type-rubrique/entities/type-rubrique.entity';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule } from '@nestjs/config';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Module({
  imports: [
    TypeOrmModule.forFeature([Fichier, TypeRubrique]),
    ConfigModule,
    MulterModule.register({
      storage: diskStorage({
        destination: './storage',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;
          callback(null, filename);
        },
      }),
    }),
  ],
  controllers: [FichierController],
  providers: [FichierService],
})
export class FichierModule { } 
