import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateFichierDto } from './dto/create-fichier.dto';
import { UpdateFichierDto } from './dto/update-fichier.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Fichier } from './entities/fichier.entity';
import { TypeRubrique } from 'src/type-rubrique/entities/type-rubrique.entity';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';

@Injectable()
export class FichierService {
  constructor(
    @InjectRepository(Fichier)
    private readonly fichierRepository: Repository<Fichier>,
    @InjectRepository(TypeRubrique)
    private readonly typeRubriqueRepository: Repository<TypeRubrique>,
    private readonly configService: ConfigService,
  ) { }

  private getBaseUrl(): string {
    const host = this.configService.get<string>('APP_HOST', 'http://localhost');
    const port = this.configService.get<string>('PORT', '3000');
    const prefix = this.configService.get<string>('API_PREFIX', 'serviceterritoriale');
    return `${host}:${port}/${prefix}`;
  }

  async create(createFichierDto: CreateFichierDto, file: Express.Multer.File) {
    try {
      // Vérifier si le fichier a été uploadé
      if (!file) {
        throw new BadRequestException('Aucun fichier n\'a été uploadé');
      }

      // Vérifier si le TypeRubrique existe
      const typeRubrique = await this.typeRubriqueRepository.findOne({
        where: { idTypeRubrique: createFichierDto.idTypeRubrique },
      });

      if (!typeRubrique) {
        throw new NotFoundException(`TypeRubrique avec l'ID ${createFichierDto.idTypeRubrique} n'existe pas`);
      }

      // Extraire les métadonnées du fichier uploadé
      const fichier = this.fichierRepository.create({
        nomFichier: file.originalname,
        typeFichier: file.mimetype,
        tailleFichier: file.size,
        cheminFichier: file.path, // Chemin complet du fichier stocké
        typeRubrique: typeRubrique,
      });

      // Sauvegarder en base de données
      return await this.fichierRepository.save(fichier);
    } catch (error) {
      throw new BadRequestException(error.message);
    }

  }

  async findAll(idTypeRubrique: string) {
    try {
      const typeRubrique = await this.typeRubriqueRepository.findOne({
        where: { idTypeRubrique: idTypeRubrique },
      });
      if (!typeRubrique) {
        throw new NotFoundException(`TypeRubrique avec l'ID ${idTypeRubrique} n'existe pas`);
      }
      const fichiers = await this.fichierRepository.find({
        relations: ['typeRubrique'],
        where: { typeRubrique: { idTypeRubrique: idTypeRubrique } },
      });

      // Ajouter l'URL de téléchargement dynamique
      const baseUrl = this.getBaseUrl();
      return fichiers.map(fichier => ({
        ...fichier,
        urlFichier: `${baseUrl}/fichier/${fichier.idFichier}/download`,
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

    if (!fichier) {
      throw new NotFoundException(`Fichier avec l'ID ${id} n'existe pas`);
    }

    // Ajouter l'URL de téléchargement dynamique
    const baseUrl = this.getBaseUrl();
    return {
      ...fichier,
      urlFichier: `${baseUrl}/fichier/${fichier.idFichier}/editer`,
    };
  }

  async remove(id: string) {
    try {
      await this.fichierRepository.delete({ idFichier: id });
      return { message: 'Fichier supprimé avec succès' };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async download(id: string) {
    const fichier = await this.fichierRepository.findOne({ where: { idFichier: id } });

    if (!fichier) {
      throw new NotFoundException(`Fichier avec l'ID ${id} n'existe pas`);
    }

    const fs = require('fs');
    if (!fs.existsSync(fichier.cheminFichier)) {
      throw new NotFoundException(`Le fichier physique n'existe pas sur le serveur`);
    }

    const file = fs.createReadStream(fichier.cheminFichier);
    return {
      stream: file,
      typeFichier: fichier.typeFichier,
      nomFichier: fichier.nomFichier,
      tailleFichier: fichier.tailleFichier,
    };
  }
}
