import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auth } from './entities/auth.entity';
import { JwtStrategy } from './jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer'; // 🚀 Importé pour Cloudinary
import { FichierModule } from '../fichier/fichier.module'; // 🚀 Importé pour CloudinaryService

@Module({
  imports: [
    TypeOrmModule.forFeature([Auth]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        // 🚀 1. Utilise bien JWT_ACCESS_SECRET ici (doit être identique à ta stratégie)
        secret: configService.get<string>('JWT_ACCESS_SECRET') || 'defaultSecret',
        signOptions: {
          expiresIn: '1d',
        },
      }),
    }),
    // 🚀 2. Passage en memoryStorage (Indispensable pour Vercel et Cloudinary)
    MulterModule.register({
      storage: memoryStorage(),
    }),
    // 🚀 3. Ajout de FichierModule pour injecter CloudinaryService dans AuthService
    FichierModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, PassportModule, JwtModule],
})
export class AuthModule { }