import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateFichierDto } from './dto/create-fichier.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Raw } from 'typeorm';
import { Fichier } from './entities/fichier.entity';
import { TypeRubrique } from '../type-rubrique/entities/type-rubrique.entity';
import { ConfigService } from '@nestjs/config';
import { CloudinaryService } from './cloudinary.service';
import { Readable } from 'stream'; // 🚀 1. AJOUTER CET IMPORT (Node.js natif)
import { Auth } from 'src/auth/entities/auth.entity';

@Injectable()
export class FichierService {
  constructor(
    @InjectRepository(Fichier)
    private readonly fichierRepository: Repository<Fichier>,
    @InjectRepository(Auth)
    private readonly authRepository: Repository<Auth>,
    @InjectRepository(TypeRubrique)
    private readonly typeRubriqueRepository: Repository<TypeRubrique>,
    private readonly configService: ConfigService,
    private readonly cloudinaryService: CloudinaryService,
  ) { }

  async create(createFichierDto: CreateFichierDto, idUtilisateur: string, file: Express.Multer.File) {
    try {
      if (!file) throw new BadRequestException('Aucun fichier n\'a été uploadé');

      const typeRubrique = await this.typeRubriqueRepository.findOne({
        where: { idTypeRubrique: createFichierDto.idTypeRubrique },
      });
      if (!typeRubrique) throw new NotFoundException(`TypeRubrique introuvable`);

      const auth = await this.authRepository.findOne({
        where: { idUtilisateur: idUtilisateur },
      });
      if (!auth) {
        throw new NotFoundException(`Utilisateur introuvable`);
      }


      const uploadResult = await this.cloudinaryService.uploadFile(file);

      const fichier = this.fichierRepository.create({
        nomFichier: file.originalname,
        typeFichier: file.mimetype,
        tailleFichier: file.size,
        cheminFichier: uploadResult.secure_url,
        typeRubrique: typeRubrique,
        privee: createFichierDto.privee,
        estValide: auth.role == "ADMIN" ? true : false,
        auth: auth
      });

      return await this.fichierRepository.save(fichier);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findAllGlobal(idTypeRubrique: string, date: string, statut: boolean) {
    try {
      const where: any = {
        typeRubrique: { idTypeRubrique },
        privee: statut
      };

      if (date) {
        // Normaliser la date (remplacer les espaces et slashs par des tirets)
        const normalizedSearch = date.replace(/[\s/]/g, '-');

        where.dateCreation = Raw((alias) =>
          `TO_CHAR(${alias}, 'DD-MM-YYYY') LIKE :date`,
          { date: `%${normalizedSearch}%` }
        );
      }

      const fichiers = await this.fichierRepository.find({
        relations: ['typeRubrique'],
        where: where,
      });


      return {
        message: "liste de fichier global",
        data: fichiers,
        status: 200
      }
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findAllStatutPrivee(idTypeRubrique: string) {
    try {
      const fichiers = await this.fichierRepository.find({
        relations: ['typeRubrique'],
        where: { typeRubrique: { idTypeRubrique: idTypeRubrique }, privee: false, estValide: true },
      });

      return {
        message: `liste de fichier `,
        data: fichiers,
        status: 200
      }
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findOne(id: string) {
    try {
      const fichier = await this.fichierRepository.findOne({
        where: { idFichier: id },
        relations: ['typeRubrique'],
      });

      if (!fichier) throw new NotFoundException(`Fichier introuvable`);
      return {
        message: "fichier trouvé",
        data: fichier,
        status: 200
      }
    } catch (error) {
      throw new BadRequestException(error.message)
    }
  }

  async updateValidation(id: string) {
    try {
      const fichier = await this.fichierRepository.findOne({ where: { idFichier: id } });
      if (!fichier) throw new NotFoundException(`Fichier introuvable`);
      fichier.estValide = !fichier.estValide;
      await this.fichierRepository.save(fichier);
      return {
        message: "Validation mise à jour",
        data: fichier,
        status: 200
      }
    } catch (error) {
      throw new BadRequestException(error.message)
    }
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