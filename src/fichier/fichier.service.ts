import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateFichierDto } from './dto/create-fichier.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Fichier } from './entities/fichier.entity';
import { TypeRubrique } from '../type-rubrique/entities/type-rubrique.entity';
import { ConfigService } from '@nestjs/config';
import { CloudinaryService } from './cloudinary.service';
import { Readable } from 'stream'; // 🚀 1. AJOUTER CET IMPORT (Node.js natif)

@Injectable()
export class FichierService {
  constructor(
    @InjectRepository(Fichier)
    private readonly fichierRepository: Repository<Fichier>,
    @InjectRepository(TypeRubrique)
    private readonly typeRubriqueRepository: Repository<TypeRubrique>,
    private readonly configService: ConfigService,
    private readonly cloudinaryService: CloudinaryService,
  ) { }

  private getBaseUrl(): string {
    const host = this.configService.get<string>('APP_HOST', 'http://localhost');
    const port = this.configService.get<string>('PORT', '3000');
    const prefix = this.configService.get<string>('API_PREFIX', 'serviceterritoriale');
    return `${host}:${port}/${prefix}`;
  }

  async create(createFichierDto: CreateFichierDto, file: Express.Multer.File) {
    try {
      if (!file) throw new BadRequestException('Aucun fichier n\'a été uploadé');

      const typeRubrique = await this.typeRubriqueRepository.findOne({
        where: { idTypeRubrique: createFichierDto.idTypeRubrique },
      });

      if (!typeRubrique) throw new NotFoundException(`TypeRubrique introuvable`);

      const uploadResult = await this.cloudinaryService.uploadFile(file);

      const fichier = this.fichierRepository.create({
        nomFichier: file.originalname,
        typeFichier: file.mimetype,
        tailleFichier: file.size,
        cheminFichier: uploadResult.secure_url,
        typeRubrique: typeRubrique,
        privee: createFichierDto.privee,
      });

      return await this.fichierRepository.save(fichier);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findAll(idTypeRubrique: string, update: Date) {
    try {
      const fichiers = await this.fichierRepository.find({
        relations: ['typeRubrique'],
        where: { typeRubrique: { idTypeRubrique: idTypeRubrique },dateCreation:update },
      });

      const baseUrl = this.getBaseUrl();
      return fichiers.map(fichier => ({
        ...fichier,
        urlFichier: `${baseUrl}/fichier/${fichier.idFichier}/telecharger`,
      }));
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findOne(id: string) {
    const fichier = await this.fichierRepository.findOne({
      where: { idFichier: id },
      relations: ['typeRubrique'],
    });

    if (!fichier) throw new NotFoundException(`Fichier introuvable`);

    const baseUrl = this.getBaseUrl();
    return {
      ...fichier,
      urlFichier: `${baseUrl}/fichier/${fichier.idFichier}/telecharger`,
    };
  }

  /**
   * 🚀 MÉTHODE DE TÉLÉCHARGEMENT CORRIGÉE POUR TYPESCRIPT
   */
  
  async download(id: string) {
    const fichier = await this.fichierRepository.findOne({ where: { idFichier: id } });

    if (!fichier) throw new NotFoundException(`Fichier introuvable`);

    try {
      const response = await fetch(fichier.cheminFichier);

      if (!response.ok) {
        throw new Error(`Erreur lors de la récupération : ${response.statusText}`);
      }

      // 🛡️ Vérification pour rassurer TypeScript
      if (!response.body) {
        throw new Error("Le flux de données du cloud est vide");
      }

      // 🚀 2. CONVERSION CRITIQUE : Web ReadableStream -> Node.js Readable
      // C'est cette ligne qui permet à StreamableFile dans le Controller de fonctionner
      const nodeStream = Readable.fromWeb(response.body as any);

      return {
        stream: nodeStream, // 👈 On renvoie le flux converti
        typeFichier: fichier.typeFichier,
        nomFichier: fichier.nomFichier,
        tailleFichier: fichier.tailleFichier,
      };
    } catch (error) {
      console.error('Erreur Fetch Cloudinary:', error.message);
      throw new BadRequestException("Impossible de récupérer le fichier sur le cloud");
    }
  }

  async remove(id: string) {
    try {
      await this.fichierRepository.delete({ idFichier: id });
      return { message: 'Fichier supprimé avec succès' };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}